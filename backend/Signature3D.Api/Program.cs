using System.Net;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Npgsql;
using Pgvector.EntityFrameworkCore;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.AI.Providers;
using Signature3D.Infrastructure.Configurations;
using Signature3D.Infrastructure.Data;
using Signature3D.Infrastructure.Services;
using Signature3D.Infrastructure.Storage;

var builder = WebApplication.CreateBuilder(args);

/* ══════════════════════════════════════════
   0. PORT — Railway
   ══════════════════════════════════════════ */

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

/* ══════════════════════════════════════════
   1. CONFIGURATION
   ══════════════════════════════════════════ */

var jwtSettings      = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
var supabaseSettings = builder.Configuration.GetSection("SupabaseSettings").Get<SupabaseSettings>()!;
var groqSettings     = builder.Configuration.GetSection("GroqSettings").Get<GroqSettings>()!;
var openAiSettings   = builder.Configuration.GetSection("OpenAISettings").Get<OpenAISettings>()!;
var claudeSettings   = builder.Configuration.GetSection("ClaudeSettings").Get<ClaudeSettings>()!;
var geminiSettings   = builder.Configuration.GetSection("GeminiSettings").Get<GeminiSettings>()!;
var googleVisionSettings = builder.Configuration.GetSection("GoogleVisionSettings").Get<GoogleVisionSettings>() ?? new GoogleVisionSettings();
var copilotSettings  = builder.Configuration.GetSection("CopilotSettings").Get<CopilotSettings>()!;
var resendSettings   = builder.Configuration.GetSection("ResendSettings").Get<ResendSettings>()!;
var appUrlsSettings  = builder.Configuration.GetSection("AppUrlsSettings").Get<AppUrlsSettings>()!;

/* ══════════════════════════════════════════
   2. BASE DE DONNÉES — PostgreSQL + Supabase
   ══════════════════════════════════════════ */

var npgsqlDataSourceBuilder = new NpgsqlDataSourceBuilder(supabaseSettings.ConnectionString);
npgsqlDataSourceBuilder.UseVector();
var npgsqlDataSource = npgsqlDataSourceBuilder.Build();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        npgsqlDataSource,
        npgsql => npgsql.EnableRetryOnFailure(3).UseVector()
    )
);

// Cache mémoire in-process — utilisé pour le cache court des chunks RAG (ChatService/DocumentService)
builder.Services.AddMemoryCache();

/* ══════════════════════════════════════════
   3. AUTHENTIFICATION JWT
   ══════════════════════════════════════════ */

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSettings.Issuer,
            ValidAudience            = jwtSettings.Audience,
            IssuerSigningKey         = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret)
            )
        };
    });

builder.Services.AddAuthorization();

/* ══════════════════════════════════════════
   4. CORS — autoriser le frontend Next.js
   ══════════════════════════════════════════ */

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = new List<string> { "http://localhost:3000" };
        if (!string.IsNullOrWhiteSpace(appUrlsSettings.FrontendUrl))
            origins.Add(appUrlsSettings.FrontendUrl);

        policy
            .WithOrigins(origins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

/* ══════════════════════════════════════════
   4bis. RATE LIMITING — endpoint chat public

   ⚠️ LIMITATION CONNUE — compteur EN MÉMOIRE, PAR INSTANCE.
   Le FixedWindowLimiter ci-dessous garde son état dans le process ASP.NET Core.
   Avec UNE SEULE instance (déploiement Railway actuel), la limite de 10 req/min
   par IP est correcte. Si ce service est un jour scalé horizontalement
   (N instances derrière un load balancer sans affinité de session), la limite
   réelle devient N×10/min par IP — chaque instance compte séparément.
   Ce n'est pas un crash ni une corruption de données, juste un affaiblissement
   silencieux de la protection anti-abus du endpoint chat public.

   Avant de scaler à plusieurs instances : soit accepter consciemment cette
   limite affaiblie, soit remplacer ce bloc par un compteur partagé —
   PostgreSQL (déjà disponible) avec une fenêtre fixe mono-ligne-par-IP
   (UPSERT atomique, pas de nouvelle dépendance) est l'option recommandée
   à l'échelle de ce projet ; Redis reste une option si un vrai besoin
   multi-instance se confirme. Détails : backend/README.md, section
   "Limitations connues".
   ══════════════════════════════════════════ */

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, token) =>
    {
        var ip = context.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "inconnue";
        Console.WriteLine($"[RateLimiter] ⚠️ Limite atteinte pour IP {ip}");

        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync(
            "{\"message\":\"Trop de requêtes. Veuillez réessayer dans un instant.\"}", token);
    };

    options.AddPolicy("chat", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // Plus stricte que "chat" — protège /api/auth/login contre le brute-force de mot de passe.
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // Généreuse — /api/visits est du tracking légitime (chaque ouverture d'expérience),
    // mais ne doit pas rester totalement illimité.
    options.AddPolicy("visits", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));
});

/* ══════════════════════════════════════════
   5. INJECTION DE DÉPENDANCES — Settings
   ══════════════════════════════════════════ */

builder.Services.AddSingleton(jwtSettings);
builder.Services.AddSingleton(supabaseSettings);
builder.Services.AddSingleton(groqSettings);
builder.Services.AddSingleton(openAiSettings);
builder.Services.AddSingleton(claudeSettings);
builder.Services.AddSingleton(geminiSettings);
builder.Services.AddSingleton(googleVisionSettings);
builder.Services.AddSingleton(copilotSettings);
builder.Services.AddSingleton(resendSettings);
builder.Services.AddSingleton(appUrlsSettings);

/* ══════════════════════════════════════════
   6. INJECTION DE DÉPENDANCES — Services
   ══════════════════════════════════════════ */

builder.Services.AddScoped<IAuthService,      AuthService>();
builder.Services.AddScoped<ISectorService,    SectorService>();
builder.Services.AddScoped<IClientService,    ClientService>();
builder.Services.AddScoped<IProjectService,   ProjectService>();
builder.Services.AddScoped<ILeadService,      LeadService>();
builder.Services.AddScoped<IVisitService,     VisitService>();
builder.Services.AddScoped<IAnalyticsService,    AnalyticsService>();
builder.Services.AddScoped<IProjectStatsService, ProjectStatsService>();
builder.Services.AddScoped<IDocumentService,  DocumentService>();
builder.Services.AddScoped<IChatService,      ChatService>();
builder.Services.AddScoped<IQrCodeService,    QrCodeService>();
builder.Services.AddScoped<IContactService,   ContactService>();
builder.Services.AddScoped<IAgendaService,    AgendaService>();
builder.Services.AddScoped<ITimelineService,  TimelineService>();
builder.Services.AddScoped<IOfferingService,  OfferingService>();
builder.Services.AddScoped<IFaqService, FaqService>();
builder.Services.AddScoped<ITestimonialService, TestimonialService>();

builder.Services.AddScoped<IAIProvider, GroqProvider>();
builder.Services.AddScoped<IEmbeddingProvider, GeminiProvider>();
builder.Services.AddScoped<IOcrProvider, GoogleVisionOcrProvider>();

builder.Services.AddScoped<IStorageService, SupabaseStorageService>();

// Email : Resend si une clé API est configurée, sinon NullEmailService (no-op).
// ResendEmailService est un HttpClient typé → ASP.NET gère le pool de connexions.
if (!string.IsNullOrWhiteSpace(resendSettings.ApiKey))
{
    builder.Services.AddHttpClient<IEmailService, ResendEmailService>();
}
else
{
    builder.Services.AddScoped<IEmailService, NullEmailService>();
}

builder.Services.AddScoped<IRealtimeService, NullRealtimeService>();

// File d'indexation RAG persistée — remplace le Task.Run fire-and-forget (survit à un redémarrage)
builder.Services.AddHostedService<Signature3D.Infrastructure.BackgroundServices.DocumentIndexingBackgroundService>();

/* ══════════════════════════════════════════
   7. CONTROLLERS + SWAGGER
   ══════════════════════════════════════════ */

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez le token JWT (sans le préfixe \"Bearer \")."
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        { new OpenApiSecuritySchemeReference("Bearer", null, null), new List<string>() }
    });
});

/* ══════════════════════════════════════════
   8. BUILD + PIPELINE HTTP
   ══════════════════════════════════════════ */

var app = builder.Build();

/* ══════════════════════════════════════════
   7bis. FORWARDED HEADERS — IP réelle du client derrière Railway

   Railway termine TLS et route tout le trafic public via son proxy interne : aucune
   requête publique n'atteint Kestrel autrement (voir section 0, UseUrls sur
   http://0.0.0.0). Sans ceci, HttpContext.Connection.RemoteIpAddress verrait l'IP du
   proxy Railway pour TOUS les visiteurs, ce qui casse le partitionnement par IP du
   rate limiter (section 4) — audit sécurité pré-staging, point Forwarded Headers.
   Placé avant toute autre middleware pour que RemoteIpAddress soit déjà correct au
   moment de UseRateLimiter() et de toute journalisation basée sur l'IP.

   Seul XForwardedFor est activé — pas XForwardedProto : Kestrel n'a ni HSTS ni
   UseHttpsRedirection (TLS déjà terminé par Railway, voir 8bis plus bas), donc rien
   ne dépend de Request.Scheme ici. Activer Proto sans ces mécanismes n'aurait aucun
   effet utile et risquerait la boucle de redirection déjà documentée en 8bis.

   X-Forwarded-For plutôt que X-Real-IP (réévalué explicitement — audit sécurité) :
   Railway documente X-Real-IP mais son propre support technique reconnaît un bug
   connu où ce header reflète l'IP du CDN plutôt que celle du visiteur quand un CDN
   est actif devant Railway — X-Forwarded-For est le header que Railway recommande
   explicitement pour cet usage.

   KnownNetworks contient la plage interne documentée du proxy Railway (100.64.0.0/10,
   RFC 6598/CGNAT) EN PLUS de la boucle locale déjà présente par défaut (utile en dev) —
   plutôt qu'un Clear() qui ferait confiance à N'IMPORTE QUEL pair TCP immédiat.
   Différence concrète : avec Clear(), le header serait honoré même si Kestrel devenait
   un jour joignable autrement qu'via Railway (erreur de config réseau, appel interne
   inattendu) ; avec cette plage, il ne l'est QUE si la connexion vient bien de Railway
   — sinon repli silencieux et sûr sur l'IP de connexion brute (dégradation vers le
   comportement actuel, jamais une ouverture). ForwardLimit = 1 ne traite qu'un seul
   maillon : la valeur ajoutée par ce proxy de confiance immédiat, jamais une valeur
   qu'un client aurait lui-même insérée plus tôt dans la chaîne.

   Limite connue, à vérifier après le premier déploiement Railway réel (voir audit) :
   si un CDN est actif devant Railway pour ce projet, la chaîne peut compter un maillon
   de plus (CDN + Railway) — potentiellement à ajuster (ForwardLimit = 2) selon la
   topologie réelle observée. Non vérifiable depuis ce code seul.
   ══════════════════════════════════════════ */
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor,
    ForwardLimit = 1,
};
forwardedHeadersOptions.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(IPAddress.Parse("100.64.0.0"), 10));
app.UseForwardedHeaders(forwardedHeadersOptions);

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerFeature>();
        Console.WriteLine($"[GlobalExceptionHandler] ❌ Exception non gérée : {feature?.Error.Message}");

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync(
            "{\"message\":\"Une erreur est survenue. Veuillez réessayer ou contacter le support.\"}");
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

/* ══════════════════════════════════════════
   8bis. HEADERS DE SÉCURITÉ

   Pas de CSP ici : l'API ne sert que du JSON, la CSP n'a de sens que pour du
   HTML rendu (gérée côté frontend, next.config.ts). Pas de HSTS/HttpsRedirection
   non plus pour l'instant — Kestrel écoute en HTTP nu (TLS terminé par Railway).
   UseForwardedHeaders (voir section 7bis ci-dessus) n'active volontairement que
   XForwardedFor, pas XForwardedProto : les activer sans HSTS/HttpsRedirection
   n'aurait aucun effet utile et risquerait une boucle de redirection (Kestrel ne
   verrait jamais X-Forwarded-Proto: https autrement que via ce header).
   ══════════════════════════════════════════ */
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    await next();
});

app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

/* ══════════════════════════════════════════
   9. SEED — initialisation base de données
   ══════════════════════════════════════════ */

using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Comptes admin + secteurs : toujours. Client/projets de démonstration ("Mercedes
        // Québec") : uniquement en Development — jamais créés automatiquement en production
        // (audit pré-déploiement, point critique n°1).
        await Signature3D.Infrastructure.Data.Seed.DbSeeder.SeedAsync(db, app.Environment.IsDevelopment());
        await Signature3D.Infrastructure.Data.Seed.DbSeeder.SeedOfferingsAsync(db);
        await Signature3D.Infrastructure.Data.Seed.DbSeeder.SeedFaqsAsync(db);
        await Signature3D.Infrastructure.Data.Seed.DbSeeder.UpdateProjectsV2Async(db);
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
        logger.LogError(ex, "Le seed a échoué au démarrage — l'app continue quand même.");
    }
}

app.Run();