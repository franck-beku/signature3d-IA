using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
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
var copilotSettings  = builder.Configuration.GetSection("CopilotSettings").Get<CopilotSettings>()!;
var resendSettings   = builder.Configuration.GetSection("ResendSettings").Get<ResendSettings>()!;
var appUrlsSettings  = builder.Configuration.GetSection("AppUrlsSettings").Get<AppUrlsSettings>()!;

/* ══════════════════════════════════════════
   2. BASE DE DONNÉES — PostgreSQL + Supabase
   ══════════════════════════════════════════ */

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        supabaseSettings.ConnectionString,
        npgsql => npgsql.EnableRetryOnFailure(3)
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

builder.Services.AddScoped<IAIProvider, GroqProvider>();

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
        await Signature3D.Infrastructure.Data.Seed.DbSeeder.SeedAsync(db);
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