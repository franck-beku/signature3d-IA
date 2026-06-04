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

    /// <summary>
    /// Seed des questions fréquentes (FAQ).
    /// Indépendant et idempotent : ne fait rien si des FAQ existent déjà.
    /// </summary>
    public static async Task SeedFaqsAsync(AppDbContext db)
    {
        if (await db.Faqs.AnyAsync())
        {
            Console.WriteLine("[Seed] FAQ déjà présentes — seed ignoré.");
            return;
        }

        Console.WriteLine("[Seed] Création des FAQ de départ...");

        var faqs = new List<Faq>
        {
            new()
            {
                Question = "Quelle différence entre 360° et Matterport ?",
                Answer = "Le 360° permet de présenter un espace avec des vues panoramiques immersives. Matterport va plus loin en créant un jumeau numérique 3D entièrement navigable, avec une sensation plus complète de visite virtuelle.",
                DisplayOrder = 1,
                IsPublished = true
            },
            new()
            {
                Question = "Qu'est-ce que Luxedia ?",
                Answer = "Luxedia est l'assistant intelligent de Signature Immersion. Il accompagne les visiteurs pendant l'expérience immersive, répond à leurs questions et les aide à passer à l'action.",
                DisplayOrder = 2,
                IsPublished = true
            },
            new()
            {
                Question = "L'IA est-elle personnalisable ?",
                Answer = "Oui. Luxedia peut être alimentée avec vos propres documents, fiches produits, catalogues, brochures ou informations internes afin de répondre avec précision aux questions de vos visiteurs.",
                DisplayOrder = 3,
                IsPublished = true
            },
            new()
            {
                Question = "Est-ce que Luxedia utilise Internet pour répondre ?",
                Answer = "Dans la première version, Luxedia répond uniquement à partir des documents fournis pour votre projet. Cela permet de garder des réponses contrôlées, cohérentes et adaptées à votre entreprise.",
                DisplayOrder = 4,
                IsPublished = true
            },
            new()
            {
                Question = "Puis-je ajouter mes propres documents ?",
                Answer = "Oui. Vous pouvez fournir des documents comme des PDF, DOCX, XLSX ou TXT. Ces fichiers servent de base de connaissance pour l'assistant Luxedia.",
                DisplayOrder = 5,
                IsPublished = true
            },
            new()
            {
                Question = "Est-ce que je peux partager mon expérience par lien ou QR code ?",
                Answer = "Oui. Chaque projet peut générer un lien public et un QR code afin de partager facilement l'expérience sur un site web, une affiche, une brochure ou directement avec un client.",
                DisplayOrder = 6,
                IsPublished = true
            },
            new()
            {
                Question = "Est-ce que l'expérience fonctionne sur mobile ?",
                Answer = "Oui. L'expérience est conçue pour fonctionner sur ordinateur, tablette et téléphone. Sur mobile, l'immersion s'affiche en plein écran avec un bouton flottant pour accéder à Luxedia.",
                DisplayOrder = 7,
                IsPublished = true
            },
            new()
            {
                Question = "Quels types d'entreprises peuvent utiliser Signature Immersion ?",
                Answer = "Signature Immersion peut s'adapter à plusieurs secteurs : automobile, immobilier, restauration, hôtellerie, commerce, espaces événementiels et autres environnements nécessitant une présentation immersive.",
                DisplayOrder = 8,
                IsPublished = true
            },
            new()
            {
                Question = "Combien de temps faut-il pour créer une expérience ?",
                Answer = "Le délai dépend du service choisi, de la taille de l'espace et du niveau de personnalisation souhaité. Après l'analyse du besoin, nous pouvons proposer un délai adapté à votre projet.",
                DisplayOrder = 9,
                IsPublished = true
            },
            new()
            {
                Question = "Combien coûte une expérience Signature Immersion ?",
                Answer = "Le tarif dépend du service choisi, de la taille de l'espace, du niveau d'intégration IA et des besoins du client. Une démonstration ou une soumission personnalisée permet d'établir un prix adapté.",
                DisplayOrder = 10,
                IsPublished = true
            },
            new()
            {
                Question = "Puis-je modifier mon expérience après sa publication ?",
                Answer = "Oui. Les informations, documents, actions personnalisées et certains contenus peuvent être mis à jour sans devoir reconstruire toute l'expérience.",
                DisplayOrder = 11,
                IsPublished = true
            }
        };

        db.Faqs.AddRange(faqs);
        await db.SaveChangesAsync();

        Console.WriteLine("[Seed] ✅ 11 FAQ créées.");
    }
}