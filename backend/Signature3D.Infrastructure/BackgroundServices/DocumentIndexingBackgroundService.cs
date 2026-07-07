using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Enums;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.BackgroundServices;

/// <summary>
/// Traite en continu la file d'indexation RAG (IndexingJob) — remplace le Task.Run fire-and-forget
/// précédent (DocumentService.UploadAsync / SetCategoryAsync) : les jobs sont persistés en base
/// et survivent à un redémarrage du process.
/// </summary>
public class DocumentIndexingBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DocumentIndexingBackgroundService> _logger;

    private static readonly TimeSpan PollInterval = TimeSpan.FromSeconds(5);

    public DocumentIndexingBackgroundService(IServiceScopeFactory scopeFactory, ILogger<DocumentIndexingBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RecoverStuckJobsAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            bool processed;
            try
            {
                processed = await ProcessNextJobAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[DocumentIndexingBackgroundService] Erreur inattendue pendant le traitement de la file.");
                processed = false;
            }

            if (!processed)
            {
                try { await Task.Delay(PollInterval, stoppingToken); }
                catch (OperationCanceledException) { break; }
            }
        }
    }

    /// <summary>
    /// Au démarrage : tout job resté "Processing" est la preuve qu'un process précédent est mort
    /// pendant son traitement (un seul job traité à la fois) — on le remet en file plutôt que
    /// de le laisser bloqué indéfiniment.
    /// </summary>
    private async Task RecoverStuckJobsAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var stuckJobs = await db.IndexingJobs
            .Where(j => j.Status == IndexingJobStatus.Processing)
            .ToListAsync(stoppingToken);

        if (stuckJobs.Count == 0) return;

        foreach (var job in stuckJobs)
        {
            job.Status = IndexingJobStatus.Pending;
            job.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(stoppingToken);

        _logger.LogWarning(
            "[DocumentIndexingBackgroundService] {Count} job(s) remis en Pending après redémarrage.",
            stuckJobs.Count);
    }

    /// <summary>Prend le plus ancien job Pending et le traite. Retourne false si la file est vide.</summary>
    private async Task<bool> ProcessNextJobAsync(CancellationToken stoppingToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var job = await db.IndexingJobs
            .Where(j => j.Status == IndexingJobStatus.Pending)
            .OrderBy(j => j.CreatedAt)
            .FirstOrDefaultAsync(stoppingToken);

        if (job is null) return false;

        var documentService = scope.ServiceProvider.GetRequiredService<IDocumentService>();
        await documentService.ProcessIndexingJobAsync(job.Id);

        return true;
    }
}
