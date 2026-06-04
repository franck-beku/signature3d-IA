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

    /// <summary>
    /// Seed des 5 offres commerciales (Offerings).
    /// Indépendant : s'exécute même si la base est déjà initialisée,
    /// et ne fait rien si les offres existent déjà (idempotent).
    /// </summary>
    public static async Task SeedOfferingsAsync(AppDbContext db)
    {
        if (await db.Offerings.AnyAsync())
        {
            Console.WriteLine("[Seed] Offres déjà présentes — seed ignoré.");
            return;
        }

        Console.WriteLine("[Seed] Création des 5 offres...");

        var offerings = new List<Offering>
        {
            new()
            {
                Name             = "360°",
                Slug             = "360",
                Level            = "Découverte",
                ShortDescription = "Immersion accessible.",
                LongDescription  = "Panoramas immersifs haute définition pour une découverte rapide et fluide de votre espace.",
                Icon             = "panorama",
                DisplayOrder     = 1,
                IsActive         = true
            },
            new()
            {
                Name             = "Matterport",
                Slug             = "matterport",
                Level            = "Professionnel",
                ShortDescription = "Jumeau numérique professionnel.",
                LongDescription  = "Visite 3D ultra-réaliste de votre espace, navigable librement par le visiteur.",
                Icon             = "cube",
                DisplayOrder     = 2,
                IsActive         = true
            },
            new()
            {
                Name             = "Luxedia IA",
                Slug             = "luxedia-ia",
                Level            = "Intelligence",
                ShortDescription = "Assistant intelligent.",
                LongDescription  = "Un ambassadeur IA qui dialogue avec vos visiteurs et répond à leurs questions en temps réel.",
                Icon             = "sparkles",
                DisplayOrder     = 3,
                IsActive         = true
            },
            new()
            {
                Name             = "360° + IA",
                Slug             = "360-ia",
                Level            = "Premium",
                ShortDescription = "Expérience augmentée.",
                LongDescription  = "La légèreté du 360° combinée à l'intelligence conversationnelle de Luxedia.",
                Icon             = "panorama-plus",
                DisplayOrder     = 4,
                IsActive         = true
            },
            new()
            {
                Name             = "Matterport + IA",
                Slug             = "matterport-ia",
                Level            = "Signature",
                ShortDescription = "Solution Signature.",
                LongDescription  = "L'immersion 3D complète accompagnée de l'assistant Luxedia. Notre offre phare.",
                Icon             = "cube-plus",
                DisplayOrder     = 5,
                IsActive         = true
            },
        };

        db.Offerings.AddRange(offerings);
        await db.SaveChangesAsync();

        Console.WriteLine("[Seed] ✅ 5 offres créées : 360°, Matterport, Luxedia IA, 360° + IA, Matterport + IA");
    }
}