using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();
builder.Services.AddScoped<IDocumentService,  DocumentService>();
builder.Services.AddScoped<IChatService,      ChatService>();
builder.Services.AddScoped<IQrCodeService,    QrCodeService>();
builder.Services.AddScoped<IContactService,   ContactService>();
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

/* ══════════════════════════════════════════
   7. CONTROLLERS + SWAGGER
   ══════════════════════════════════════════ */

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

/* ══════════════════════════════════════════
   8. BUILD + PIPELINE HTTP
   ══════════════════════════════════════════ */

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
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