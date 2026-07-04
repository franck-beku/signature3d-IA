using Microsoft.EntityFrameworkCore;
using Signature3D.Domain.Entities;

namespace Signature3D.Infrastructure.Data;

/// <summary>
/// Contexte principal de la base de données PostgreSQL.
/// Contient toutes les tables de l'application Signature 3D IA.
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    /* ── Tables ── */
    public DbSet<User> Users => Set<User>();
    public DbSet<Sector> Sectors => Set<Sector>();
    public DbSet<Offering> Offerings => Set<Offering>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectButton> ProjectButtons => Set<ProjectButton>();
    public DbSet<ProjectSuggestion> ProjectSuggestions => Set<ProjectSuggestion>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<DocumentChunk> DocumentChunks => Set<DocumentChunk>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<AnalyticsEvent> AnalyticsEvents => Set<AnalyticsEvent>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<ProjectDetail> ProjectDetails => Set<ProjectDetail>();
    public DbSet<QrCode> QrCodes => Set<QrCode>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<AgendaEvent> AgendaEvents => Set<AgendaEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        /* ── Extension pgvector pour PostgreSQL ── */
        modelBuilder.HasPostgresExtension("vector");

        /* ── User ── */
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.Name).HasMaxLength(128);
            e.Property(x => x.Role).HasMaxLength(32).HasDefaultValue("admin");
        });

        /* ── Sector ── */
        modelBuilder.Entity<Sector>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Name).HasMaxLength(128);
            e.Property(x => x.Slug).HasMaxLength(128);
        });

        /* ── Client ── */
        modelBuilder.Entity<Client>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Name).HasMaxLength(256);
            e.Property(x => x.Slug).HasMaxLength(256);
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.Status).HasConversion<string>();

            // Client → Sector (many-to-one)
            e.HasOne(x => x.Sector)
             .WithMany(x => x.Clients)
             .HasForeignKey(x => x.SectorId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        /* ── Project ── */
        modelBuilder.Entity<Project>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Name).HasMaxLength(256);
            e.Property(x => x.Slug).HasMaxLength(256);
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.ExperienceType).HasConversion<string>();

            // Project → Client (many-to-one)
            e.HasOne(x => x.Client)
             .WithMany(x => x.Projects)
             .HasForeignKey(x => x.ClientId)
             .OnDelete(DeleteBehavior.Cascade);

            // Project → QrCode (one-to-one)
            e.HasOne(x => x.QrCode)
             .WithOne(x => x.Project)
             .HasForeignKey<QrCode>(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── ProjectButton ── */
        modelBuilder.Entity<ProjectButton>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Label).HasMaxLength(128);
            e.Property(x => x.Action).HasConversion<string>();

            e.HasOne(x => x.Project)
             .WithMany(x => x.Buttons)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── ProjectSuggestion ── */
        modelBuilder.Entity<ProjectSuggestion>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Label).HasMaxLength(128);

            e.HasOne(x => x.Project)
             .WithMany(x => x.Suggestions)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── Document ── */
        modelBuilder.Entity<Document>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(512);

            e.HasOne(x => x.Project)
             .WithMany(x => x.Documents)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── DocumentChunk (RAG) ── */
        modelBuilder.Entity<DocumentChunk>(e =>
        {
            e.HasKey(x => x.Id);

            // Ignorer l'embedding float[] — pgvector sera activé via migration SQL manuelle
            // après que l'extension vector soit activée dans Supabase
            e.Ignore(x => x.Embedding);

            e.HasOne(x => x.Document)
             .WithMany(x => x.Chunks)
             .HasForeignKey(x => x.DocumentId)
             .OnDelete(DeleteBehavior.Cascade);
        });

         /* ── Lead ── */
modelBuilder.Entity<Lead>(e =>
{
    e.HasKey(x => x.Id);
    e.Property(x => x.Status).HasConversion<string>();
 
    // Project → Lead : relation OPTIONNELLE.
    // Un lead « contact général » (accueil / page contact) n'a pas de projet.
    // SetNull : si le projet est supprimé, le lead est CONSERVÉ (ProjectId → null).
    e.HasOne(x => x.Project)
     .WithMany(x => x.Leads)
     .HasForeignKey(x => x.ProjectId)
     .IsRequired(false)
     .OnDelete(DeleteBehavior.SetNull);
});

        /* ── Visit ── */
        modelBuilder.Entity<Visit>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Source).HasConversion<string>();

            e.HasOne(x => x.Project)
             .WithMany(x => x.Visits)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── AnalyticsEvent ── */
        modelBuilder.Entity<AnalyticsEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.EventType).HasConversion<string>();
            e.Property(x => x.Metadata).HasColumnType("text");

            e.HasOne(x => x.Project)
             .WithMany(x => x.AnalyticsEvents)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── ChatSession ── */
        modelBuilder.Entity<ChatSession>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.SessionToken).IsUnique();

            e.HasOne(x => x.Project)
             .WithMany(x => x.ChatSessions)
             .HasForeignKey(x => x.ProjectId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── ChatMessage ── */
        modelBuilder.Entity<ChatMessage>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Role).HasMaxLength(16);

            e.HasOne(x => x.ChatSession)
             .WithMany(x => x.Messages)
             .HasForeignKey(x => x.ChatSessionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── QrCode ── */
        modelBuilder.Entity<QrCode>(e =>
        {
            e.HasKey(x => x.Id);
        });

        /* ── Contact ── */
        modelBuilder.Entity<Contact>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(256);
            e.Property(x => x.Position).HasMaxLength(256);
            e.Property(x => x.Email).HasMaxLength(256);
            e.Property(x => x.Phone).HasMaxLength(64);
            e.Property(x => x.PhoneExtension).HasMaxLength(32);

            e.HasOne(x => x.Client)
             .WithMany(x => x.Contacts)
             .HasForeignKey(x => x.ClientId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        /* ── AgendaEvent ── */
        modelBuilder.Entity<AgendaEvent>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(512);
            e.Property(x => x.Location).HasMaxLength(512);
            e.Property(x => x.Type).HasConversion<string>();

            e.HasOne(x => x.Client).WithMany()
             .HasForeignKey(x => x.ClientId).IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.Project).WithMany()
             .HasForeignKey(x => x.ProjectId).IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.Contact).WithMany()
             .HasForeignKey(x => x.ContactId).IsRequired(false)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}