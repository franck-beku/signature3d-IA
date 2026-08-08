using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Pgvector.EntityFrameworkCore;
using Signature3D.Application.DTOs.Projects;
using Signature3D.Domain.Entities;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Configurations;
using Signature3D.Infrastructure.Data;
using Signature3D.Infrastructure.Services;

namespace Signature3D.Tests;

/// <summary>
/// Test d'intégration contre la vraie base de développement Supabase — nécessaire pour
/// reproduire le bug réel corrigé cette session (conflit entre une transaction manuelle
/// et EnableRetryOnFailure de Npgsql). Un SQLite en mémoire ne peut pas reproduire ce
/// comportement, spécifique au provider Npgsql.
///
/// Ne s'exécute PAS automatiquement avec un `dotnet test` normal (catégorisé "Integration").
/// Pour l'exclure explicitement :   dotnet test --filter "Category!=Integration"
/// Pour ne lancer QUE ce test :     dotnet test --filter "Category=Integration"
///
/// Nécessite Signature3D.Tests/appsettings.Test.json (gitignoré) avec une chaîne de
/// connexion valide sous ConnectionStrings:TestDatabase.
///
/// Crée son propre client/projet de test (slug très distinctif "zzz-test-updateasync-...")
/// et le supprime systématiquement dans un bloc finally qui enveloppe tout le test — donc
/// exécuté même si une exception survient avant d'atteindre les assertions.
/// </summary>
[Trait("Category", "Integration")]
public class ProjectServiceUpdateTests
{
    private static AppDbContext CreateDbContext()
    {
        // appsettings.Test.json reste supporté (optional) le temps de la migration ; la source de
        // vérité est maintenant dotnet user-secrets (dotnet user-secrets set "ConnectionStrings:TestDatabase" "..."
        // --project Signature3D.Tests), qui prime si les deux sont présents (dernière source ajoutée gagne).
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Test.json", optional: true)
            .AddUserSecrets<ProjectServiceUpdateTests>()
            .Build();

        var connString = config.GetConnectionString("TestDatabase")
            ?? throw new InvalidOperationException(
                "Connection string 'TestDatabase' introuvable. Configure-la via : dotnet user-secrets set \"ConnectionStrings:TestDatabase\" \"...\" --project Signature3D.Tests");

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connString, npgsql => npgsql.EnableRetryOnFailure(3).UseVector())
            .Options;

        return new AppDbContext(options);
    }

    [Fact]
    public async Task UpdateAsync_RemplaceBoutonsSuggestionsDetails_SansResidu()
    {
        await using var db = CreateDbContext();
        var service = new ProjectService(db, new AppUrlsSettings());

        var sector = await db.Sectors.FirstAsync();

        var testTag = $"zzz-test-updateasync-{Guid.NewGuid():N}";
        var client = new Client
        {
            Name = testTag,
            Slug = testTag,
            Email = "zzz-test@example.com",
            ContractDate = DateTime.UtcNow,
            DeliveryDate = DateTime.UtcNow,
            Status = ClientStatus.Actif,
            SectorId = sector.Id,
        };
        db.Clients.Add(client);
        await db.SaveChangesAsync();

        try
        {
            // 1) Créer un projet avec quelques boutons/suggestions/détails initiaux
            var createDto = new CreateProjectDto
            {
                Name = testTag,
                ClientId = client.Id,
                AmbassadorName = "Luxedia",
                Buttons =
                [
                    new CreateButtonDto { Label = "Ancien bouton A", Action = "link", Order = 0 },
                    new CreateButtonDto { Label = "Ancien bouton B", Action = "link", Order = 1 },
                ],
                Suggestions =
                [
                    new CreateSuggestionDto { Label = "Ancienne suggestion", Order = 0 },
                ],
                Details =
                [
                    new CreateDetailDto { Label = "Ancien détail", Value = "X", DisplayOrder = 0, IsVisible = true },
                ],
            };

            var createResult = await service.CreateAsync(createDto);
            Assert.True(createResult.Success, createResult.Error);
            var projectId = createResult.Data!.Id;

            // 2) Appeler UpdateAsync avec une liste différente
            var updateDto = new UpdateProjectDto
            {
                Name = testTag,
                AmbassadorName = "Luxedia",
                Status = "Active",
                Buttons =
                [
                    new CreateButtonDto { Label = "Nouveau bouton X", Action = "link", Order = 0 },
                ],
                Suggestions =
                [
                    new CreateSuggestionDto { Label = "Nouvelle suggestion", Order = 0 },
                    new CreateSuggestionDto { Label = "Nouvelle suggestion 2", Order = 1 },
                ],
                Details =
                [
                    new CreateDetailDto { Label = "Nouveau détail", Value = "Y", DisplayOrder = 0, IsVisible = true },
                ],
            };

            var updateResult = await service.UpdateAsync(projectId, updateDto);

            // 3) L'update doit réussir — c'est exactement ce que le bug de transaction empêchait.
            Assert.True(updateResult.Success, updateResult.Error);

            // 4) Recharger indépendamment depuis la DB (pas depuis le DTO retourné) pour vérifier
            //    l'état réellement persisté : anciennes données disparues, nouvelles présentes,
            //    aucun doublon ni résidu.
            var buttons = await db.ProjectButtons.Where(b => b.ProjectId == projectId).ToListAsync();
            var suggestions = await db.ProjectSuggestions.Where(s => s.ProjectId == projectId).ToListAsync();
            var details = await db.ProjectDetails.Where(d => d.ProjectId == projectId).ToListAsync();

            Assert.Single(buttons);
            Assert.Equal("Nouveau bouton X", buttons[0].Label);

            Assert.Equal(2, suggestions.Count);
            Assert.DoesNotContain(suggestions, s => s.Label == "Ancienne suggestion");
            Assert.Contains(suggestions, s => s.Label == "Nouvelle suggestion");
            Assert.Contains(suggestions, s => s.Label == "Nouvelle suggestion 2");

            Assert.Single(details);
            Assert.Equal("Nouveau détail", details[0].Label);
        }
        finally
        {
            // Nettoyage garanti par la sémantique try/finally du langage : ce bloc s'exécute
            // que le try se termine normalement, par un échec d'assertion (qui lève une
            // exception xUnit), ou par une exception imprévue — dans tous les cas, avant que
            // l'exception ne se propage. La base de dev n'est jamais polluée durablement.
            //
            // Suppression directe (sans passer par le change tracker) — même pattern "robuste,
            // sans tracking" que ProjectService.UpdateAsync, pour éviter tout conflit de
            // concurrence avec EnableRetryOnFailure sur un Remove()+SaveChangesAsync classique.
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }
}
