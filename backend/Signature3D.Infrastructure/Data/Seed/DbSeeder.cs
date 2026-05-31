using Microsoft.EntityFrameworkCore;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;

namespace Signature3D.Infrastructure.Data.Seed;

/// <summary>
/// Seeder de la base de données.
/// Crée les données initiales : utilisateurs Alain et Franck + secteurs de base.
/// À exécuter une seule fois au démarrage si la base est vide.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        // Vérifier si le seed a déjà été fait
        if (await db.Users.AnyAsync())
        {
            Console.WriteLine("[Seed] Base de données déjà initialisée — seed ignoré.");
            return;
        }

        Console.WriteLine("[Seed] Initialisation de la base de données...");

        /* ── Utilisateurs ── */
        var alain = new User
        {
            Name          = "Alain Dubé",
            Email         = "alain@signature3d.ai",
            PasswordHash  = BCrypt.Net.BCrypt.HashPassword("alain123"),
            Role          = "admin",
            IsActive      = true
        };

        var franck = new User
        {
            Name          = "Franck Beku",
            Email         = "franck@signature3d.ai",
            PasswordHash  = BCrypt.Net.BCrypt.HashPassword("franck123"),
            Role          = "admin",
            IsActive      = true
        };

        db.Users.AddRange(alain, franck);

        /* ── Secteurs de base ── */
        var secteurs = new List<Sector>
        {
            new() { Name = "Automobile",   Slug = "automobile"   },
            new() { Name = "Immobilier",   Slug = "immobilier"   },
            new() { Name = "Restaurant",   Slug = "restaurant"   },
            new() { Name = "Hôtellerie",   Slug = "hotellerie"   },
            new() { Name = "Commerce",     Slug = "commerce"     },
            new() { Name = "Événementiel", Slug = "evenementiel" },
        };

        db.Sectors.AddRange(secteurs);

        /* ── Client démo — Mercedes Québec ── */
        var sectorAuto = secteurs[0];

        var mercedes = new Client
        {
            Name           = "Mercedes Québec",
            Slug           = "mercedes-quebec",
            Email          = "contact@mercedesquebec.ca",
            Phone          = "+1 (418) 000-0000",
            Notes          = "Client prioritaire — prototype en cours.",
            ContractDate   = new DateTime(2025, 5, 1, 0, 0, 0, DateTimeKind.Utc),
            DeliveryDate   = new DateTime(2025, 6, 1, 0, 0, 0, DateTimeKind.Utc),
            Status         = ClientStatus.Actif,
            Priority       = 1,
            Sector         = sectorAuto
        };

        db.Clients.Add(mercedes);

        /* ── Projets démo Mercedes ── */
        var projets = new List<Project>
        {
            new()
            {
                Name           = "Mercedes CLE 53 AMG",
                Slug           = "mercedes-voiture-1",
                MatterportId   = "WJzvgHF44zq",
                AmbassadorName = "Luxedia",
                WelcomeMessage = "Bienvenue chez Mercedes Québec ! Je suis Luxedia, votre assistant intelligent. Comment puis-je vous aider ?",
                Status         = ProjectStatus.Active,
                Client         = mercedes,
                Buttons        = new List<ProjectButton>
                {
                    new() { Label = "Réserver un essai",     Url = "https://mercedes.ca",       Action = ButtonActionType.Link, Order = 0 },
                    new() { Label = "Demander un prix",       Url = "",                           Action = ButtonActionType.Form, Order = 1 },
                    new() { Label = "Parler à un conseiller", Url = "tel:+15140000000",           Action = ButtonActionType.Call, Order = 2 },
                    new() { Label = "Itinéraire concession",  Url = "https://maps.google.com",   Action = ButtonActionType.Link, Order = 3 },
                }
            },
            new()
            {
                Name           = "Mercedes Showroom",
                Slug           = "mercedes-voiture-2",
                MatterportId   = "Fg8etsLyrWz",
                AmbassadorName = "Luxedia",
                WelcomeMessage = "Bienvenue dans notre showroom virtuel ! Je suis Luxedia. Que puis-je faire pour vous ?",
                Status         = ProjectStatus.Active,
                Client         = mercedes,
                Buttons        = new List<ProjectButton>
                {
                    new() { Label = "Réserver un essai",     Url = "https://mercedes.ca", Action = ButtonActionType.Link, Order = 0 },
                    new() { Label = "Demander un prix",       Url = "",                    Action = ButtonActionType.Form, Order = 1 },
                    new() { Label = "Parler à un conseiller", Url = "tel:+15140000000",    Action = ButtonActionType.Call, Order = 2 },
                }
            },
            new()
            {
                Name           = "Mercedes Collection",
                Slug           = "mercedes-voiture-3",
                MatterportId   = "gTHjEVgJEbZ",
                AmbassadorName = "Luxedia",
                WelcomeMessage = "Découvrez notre collection ! Je suis Luxedia, votre guide virtuel.",
                Status         = ProjectStatus.Active,
                Client         = mercedes,
                Buttons        = new List<ProjectButton>
                {
                    new() { Label = "Réserver un essai", Url = "https://mercedes.ca", Action = ButtonActionType.Link, Order = 0 },
                    new() { Label = "Demander un prix",   Url = "",                    Action = ButtonActionType.Form, Order = 1 },
                }
            },
        };

        db.Projects.AddRange(projets);

        /* ── Sauvegarder tout ── */
        await db.SaveChangesAsync();

        Console.WriteLine("[Seed] ✅ Base initialisée avec succès !");
        Console.WriteLine("[Seed] Utilisateurs créés :");
        Console.WriteLine("[Seed]   → alain@signature3d.ai / alain123");
        Console.WriteLine("[Seed]   → franck@signature3d.ai / franck123");
        Console.WriteLine("[Seed] Secteurs créés : Automobile, Immobilier, Restaurant, Hôtellerie, Commerce, Événementiel");
        Console.WriteLine("[Seed] Client démo : Mercedes Québec avec 3 projets");
    }
}