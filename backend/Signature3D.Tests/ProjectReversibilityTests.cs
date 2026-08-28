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
/// Vérifie le chantier "réversibilité Matterport / 360° / Luxedia sur un même projet" :
/// bascule ON/OFF sans perte de MatterportId/ExperienceUrl, produit immersif de référence
/// verrouillé, et les trois garde-fous ajoutés à ProjectService (IAOnly+LuxediaEnabled=false,
/// coexistence MatterportId+ExperienceUrl, changement de produit de référence).
///
/// Même pattern d'intégration que ProjectServiceUpdateTests : base de dev Supabase réelle,
/// client/projet jetables créés et supprimés dans un try/finally, jamais de données de
/// production touchées. dotnet test --filter "Category=Integration" pour l'exécuter seul.
/// </summary>
[Trait("Category", "Integration")]
public class ProjectReversibilityTests
{
    private static AppDbContext CreateDbContext()
    {
        var config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.Test.json", optional: true)
            .AddUserSecrets<ProjectReversibilityTests>()
            .Build();

        var connString = config.GetConnectionString("TestDatabase")
            ?? throw new InvalidOperationException(
                "Connection string 'TestDatabase' introuvable. Configure-la via : dotnet user-secrets set \"ConnectionStrings:TestDatabase\" \"...\" --project Signature3D.Tests");

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connString, npgsql => npgsql.EnableRetryOnFailure(3).UseVector())
            .Options;

        return new AppDbContext(options);
    }

    private static async Task<(AppDbContext db, ProjectService service, Client client)> SetupAsync(string testTag)
    {
        var db = CreateDbContext();
        var service = new ProjectService(db, new AppUrlsSettings());
        var sector = await db.Sectors.FirstAsync();

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

        return (db, service, client);
    }

    [Fact]
    public async Task Matterport_ToggleOff_PuisOn_ConserveLeMemeMatterportId()
    {
        var testTag = $"zzz-test-reversibilite-mp-{Guid.NewGuid():N}";
        var (db, service, client) = await SetupAsync(testTag);

        try
        {
            const string originalMatterportId = "WJzvgHF44zq";

            var createResult = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag,
                ClientId = client.Id,
                AmbassadorName = "Luxedia",
                MatterportId = originalMatterportId,
                ExperienceType = "Matterport",
                LuxediaEnabled = true,
            });
            Assert.True(createResult.Success, createResult.Error);
            var projectId = createResult.Data!.Id;

            // Matterport + IA → Matterport seul (Luxedia OFF)
            var toMatterportOnly = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Matterport", originalMatterportId, null, luxediaEnabled: false));
            Assert.True(toMatterportOnly.Success, toMatterportOnly.Error);

            // → retour Matterport + IA (Luxedia ON) — sauvegarde + rechargement indépendant
            var backToBoth = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Matterport", originalMatterportId, null, luxediaEnabled: true));
            Assert.True(backToBoth.Success, backToBoth.Error);

            var reloaded1 = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.Matterport, reloaded1.ExperienceType);
            Assert.Equal(originalMatterportId, reloaded1.MatterportId);
            Assert.True(reloaded1.LuxediaEnabled);

            // Matterport + IA → IA seule (Matterport OFF, MatterportId conservé)
            var toIAOnly = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "IAOnly", originalMatterportId, null, luxediaEnabled: true));
            Assert.True(toIAOnly.Success, toIAOnly.Error);

            var reloadedIAOnly = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.IAOnly, reloadedIAOnly.ExperienceType);
            Assert.Equal(originalMatterportId, reloadedIAOnly.MatterportId); // ← preuve : jamais supprimé
            Assert.True(reloadedIAOnly.LuxediaEnabled);

            // → retour Matterport + IA avec le MÊME MatterportId (pas resaisi)
            var reactivated = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Matterport", reloadedIAOnly.MatterportId, null, luxediaEnabled: true));
            Assert.True(reactivated.Success, reactivated.Error);

            var reloadedFinal = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.Matterport, reloadedFinal.ExperienceType);
            Assert.Equal(originalMatterportId, reloadedFinal.MatterportId);
        }
        finally
        {
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task Tour360_ToggleOff_PuisOn_ConserveLaMemeExperienceUrl()
    {
        var testTag = $"zzz-test-reversibilite-360-{Guid.NewGuid():N}";
        var (db, service, client) = await SetupAsync(testTag);

        try
        {
            const string originalUrl = "https://glo3d.net/xxxxx-test";

            var createResult = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag,
                ClientId = client.Id,
                AmbassadorName = "Luxedia",
                ExperienceUrl = originalUrl,
                ExperienceType = "Tour360",
                LuxediaEnabled = true,
            });
            Assert.True(createResult.Success, createResult.Error);
            var projectId = createResult.Data!.Id;

            // 360° + IA → 360° seul
            var to360Only = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Tour360", null, originalUrl, luxediaEnabled: false));
            Assert.True(to360Only.Success, to360Only.Error);

            // → retour 360° + IA
            var backToBoth = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Tour360", null, originalUrl, luxediaEnabled: true));
            Assert.True(backToBoth.Success, backToBoth.Error);

            var reloaded1 = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.Tour360, reloaded1.ExperienceType);
            Assert.Equal(originalUrl, reloaded1.ExperienceUrl);

            // 360° + IA → IA seule (ExperienceUrl conservée)
            var toIAOnly = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "IAOnly", null, originalUrl, luxediaEnabled: true));
            Assert.True(toIAOnly.Success, toIAOnly.Error);

            var reloadedIAOnly = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.IAOnly, reloadedIAOnly.ExperienceType);
            Assert.Equal(originalUrl, reloadedIAOnly.ExperienceUrl); // ← preuve : jamais supprimée

            // → retour 360° + IA avec la MÊME ExperienceUrl
            var reactivated = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Tour360", null, reloadedIAOnly.ExperienceUrl, luxediaEnabled: true));
            Assert.True(reactivated.Success, reactivated.Error);

            var reloadedFinal = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.Tour360, reloadedFinal.ExperienceType);
            Assert.Equal(originalUrl, reloadedFinal.ExperienceUrl);
        }
        finally
        {
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task IASeule_CreeeDirectement_NePeutJamaisGagnerMatterportOu360()
    {
        var testTag = $"zzz-test-reversibilite-iaseule-{Guid.NewGuid():N}";
        var (db, service, client) = await SetupAsync(testTag);

        try
        {
            var createResult = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag,
                ClientId = client.Id,
                AmbassadorName = "Luxedia",
                ExperienceType = "IAOnly",
                LuxediaEnabled = true,
            });
            Assert.True(createResult.Success, createResult.Error);
            var projectId = createResult.Data!.Id;

            // Une simple modification (nom) doit continuer à fonctionner, en restant IAOnly.
            var normalUpdate = await service.UpdateAsync(projectId, BaseUpdateDto(testTag + "-renomme", "IAOnly", null, null, luxediaEnabled: true));
            Assert.True(normalUpdate.Success, normalUpdate.Error);

            // Tentative (même via un appel direct au service, hors dashboard) de lui assigner
            // Matterport — doit être refusée : ce projet n'a jamais eu de MatterportId.
            var tryMatterport = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Matterport", "un-nouvel-id-invente", null, luxediaEnabled: true));
            Assert.False(tryMatterport.Success);

            // Idem pour 360°.
            var try360 = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "Tour360", null, "https://glo3d.net/invente", luxediaEnabled: true));
            Assert.False(try360.Success);

            var reloaded = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(ExperienceType.IAOnly, reloaded.ExperienceType);
            Assert.Null(reloaded.MatterportId);
            Assert.Null(reloaded.ExperienceUrl);
        }
        finally
        {
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task GardeFou_IAOnlyAvecLuxediaDesactive_EstRefuse()
    {
        var testTag = $"zzz-test-gardefou-luxedia-{Guid.NewGuid():N}";
        var (db, service, client) = await SetupAsync(testTag);

        try
        {
            var createRejected = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag,
                ClientId = client.Id,
                AmbassadorName = "Luxedia",
                ExperienceType = "IAOnly",
                LuxediaEnabled = false,
            });
            Assert.False(createRejected.Success);

            // Créer un projet valide, puis tenter la même violation via Update.
            var createValid = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag, ClientId = client.Id, AmbassadorName = "Luxedia",
                ExperienceType = "IAOnly", LuxediaEnabled = true,
            });
            Assert.True(createValid.Success, createValid.Error);
            var projectId = createValid.Data!.Id;

            var updateRejected = await service.UpdateAsync(projectId, BaseUpdateDto(testTag, "IAOnly", null, null, luxediaEnabled: false));
            Assert.False(updateRejected.Success);

            var reloaded = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.True(reloaded.LuxediaEnabled); // ← l'update rejeté n'a rien modifié
        }
        finally
        {
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task GardeFou_MatterportIdEtExperienceUrlSimultanes_EstRefuse()
    {
        var testTag = $"zzz-test-gardefou-coexistence-{Guid.NewGuid():N}";
        var (db, service, client) = await SetupAsync(testTag);

        try
        {
            var createRejected = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag, ClientId = client.Id, AmbassadorName = "Luxedia",
                MatterportId = "abc123", ExperienceUrl = "https://glo3d.net/xxxxx",
                ExperienceType = "Matterport", LuxediaEnabled = true,
            });
            Assert.False(createRejected.Success);

            var createValid = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag, ClientId = client.Id, AmbassadorName = "Luxedia",
                MatterportId = "abc123", ExperienceType = "Matterport", LuxediaEnabled = true,
            });
            Assert.True(createValid.Success, createValid.Error);
            var projectId = createValid.Data!.Id;

            var updateRejected = await service.UpdateAsync(projectId,
                BaseUpdateDto(testTag, "Matterport", "abc123", "https://glo3d.net/xxxxx", luxediaEnabled: true));
            Assert.False(updateRejected.Success);

            var reloaded = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Null(reloaded.ExperienceUrl); // ← l'update rejeté n'a rien modifié
        }
        finally
        {
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task GardeFou_ChangementDeProduitDeReference_EstRefuseDansLesDeuxSens()
    {
        var testTagMp = $"zzz-test-gardefou-mp-vers-360-{Guid.NewGuid():N}";
        var (dbMp, serviceMp, clientMp) = await SetupAsync(testTagMp);
        try
        {
            var created = await serviceMp.CreateAsync(new CreateProjectDto
            {
                Name = testTagMp, ClientId = clientMp.Id, AmbassadorName = "Luxedia",
                MatterportId = "abc123", ExperienceType = "Matterport", LuxediaEnabled = true,
            });
            Assert.True(created.Success, created.Error);

            // Matterport → 360° : refusé (changement de produit, hors périmètre de ce chantier).
            var switchToTour360 = await serviceMp.UpdateAsync(created.Data!.Id,
                BaseUpdateDto(testTagMp, "Tour360", null, "https://glo3d.net/nouveau", luxediaEnabled: true));
            Assert.False(switchToTour360.Success);

            var reloadedMp = await dbMp.Projects.AsNoTracking().FirstAsync(p => p.Id == created.Data!.Id);
            Assert.Equal(ExperienceType.Matterport, reloadedMp.ExperienceType); // ← inchangé
            Assert.Equal("abc123", reloadedMp.MatterportId);
        }
        finally
        {
            await dbMp.Clients.Where(c => c.Id == clientMp.Id).ExecuteDeleteAsync();
        }

        var testTag360 = $"zzz-test-gardefou-360-vers-mp-{Guid.NewGuid():N}";
        var (db360, service360, client360) = await SetupAsync(testTag360);
        try
        {
            var created = await service360.CreateAsync(new CreateProjectDto
            {
                Name = testTag360, ClientId = client360.Id, AmbassadorName = "Luxedia",
                ExperienceUrl = "https://glo3d.net/xxxxx", ExperienceType = "Tour360", LuxediaEnabled = true,
            });
            Assert.True(created.Success, created.Error);

            // 360° → Matterport : refusé également, dans l'autre sens.
            var switchToMatterport = await service360.UpdateAsync(created.Data!.Id,
                BaseUpdateDto(testTag360, "Matterport", "nouveau-id", null, luxediaEnabled: true));
            Assert.False(switchToMatterport.Success);

            var reloaded360 = await db360.Projects.AsNoTracking().FirstAsync(p => p.Id == created.Data!.Id);
            Assert.Equal(ExperienceType.Tour360, reloaded360.ExperienceType); // ← inchangé
            Assert.Equal("https://glo3d.net/xxxxx", reloaded360.ExperienceUrl);
        }
        finally
        {
            await db360.Clients.Where(c => c.Id == client360.Id).ExecuteDeleteAsync();
        }
    }

    [Fact]
    public async Task ModificationNormale_NomEtCouleursLuxedia_ContinueDeFonctionner()
    {
        var testTag = $"zzz-test-modif-normale-{Guid.NewGuid():N}";
        var (db, service, client) = await SetupAsync(testTag);

        try
        {
            var created = await service.CreateAsync(new CreateProjectDto
            {
                Name = testTag, ClientId = client.Id, AmbassadorName = "Luxedia",
                MatterportId = "abc123", ExperienceType = "Matterport", LuxediaEnabled = true,
            });
            Assert.True(created.Success, created.Error);
            var projectId = created.Data!.Id;

            var dto = BaseUpdateDto(testTag + " — renommé", "Matterport", "abc123", null, luxediaEnabled: true);
            dto.LuxediaPrimaryColor = "#123456";
            dto.LuxediaWidgetBgColor = "#654321";

            var updateResult = await service.UpdateAsync(projectId, dto);
            Assert.True(updateResult.Success, updateResult.Error);

            var reloaded = await db.Projects.AsNoTracking().FirstAsync(p => p.Id == projectId);
            Assert.Equal(testTag + " — renommé", reloaded.Name);
            Assert.Equal("#123456", reloaded.LuxediaPrimaryColor);
            Assert.Equal("#654321", reloaded.LuxediaWidgetBgColor);
            Assert.Equal(ExperienceType.Matterport, reloaded.ExperienceType);
            Assert.Equal("abc123", reloaded.MatterportId);
        }
        finally
        {
            await db.Clients.Where(c => c.Id == client.Id).ExecuteDeleteAsync();
        }
    }

    private static UpdateProjectDto BaseUpdateDto(string name, string experienceType, string? matterportId, string? experienceUrl, bool luxediaEnabled) => new()
    {
        Name = name,
        AmbassadorName = "Luxedia",
        Status = "Active",
        ExperienceType = experienceType,
        MatterportId = matterportId,
        ExperienceUrl = experienceUrl,
        LuxediaEnabled = luxediaEnabled,
    };
}
