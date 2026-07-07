using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Services;

namespace Signature3D.Tests;

/// <summary>
/// Tests unitaires du scoring RAG (ChatService.ScoreAndSelectChunks) — purement en mémoire,
/// aucune base de données. La méthode est "internal" et exposée à ce projet via
/// [InternalsVisibleTo] dans Signature3D.Infrastructure.csproj.
/// </summary>
public class RagScoringTests
{
    private static DocumentChunk Chunk(int index, string content) =>
        new() { ChunkIndex = index, Content = content, DocumentId = Guid.NewGuid() };

    [Fact]
    public void ChunkContenantUnMotCle_EstScoreEtRetourne()
    {
        var chunks = new List<DocumentChunk>
        {
            Chunk(0, "Nos horaires d'ouverture sont du lundi au vendredi."),
            Chunk(1, "Contactez-nous pour toute question sur nos garanties."),
        };

        var result = ChatService.ScoreAndSelectChunks(chunks, "Quels sont vos horaires ?");

        Assert.NotNull(result);
        Assert.Contains("horaires d'ouverture", result);
    }

    [Fact]
    public void AucunMotDePlusDeTroisCaracteres_FallbackSurLesTroisPremiersChunks()
    {
        var chunks = new List<DocumentChunk>
        {
            Chunk(0, "Premier chunk du document."),
            Chunk(1, "Deuxième chunk du document."),
            Chunk(2, "Troisième chunk du document."),
            Chunk(3, "Quatrième chunk qui ne doit pas apparaître."),
        };

        // Aucun mot de plus de 3 caractères (que des mots courts + ponctuation)
        var result = ChatService.ScoreAndSelectChunks(chunks, "ça va ?");

        Assert.NotNull(result);
        Assert.Contains("Premier chunk", result);
        Assert.Contains("Deuxième chunk", result);
        Assert.Contains("Troisième chunk", result);
        Assert.DoesNotContain("Quatrième chunk", result);
    }

    [Fact]
    public void AucunChunkNeMatche_FallbackSurLesTroisPremiersChunks()
    {
        var chunks = new List<DocumentChunk>
        {
            Chunk(0, "Premier chunk sans rapport."),
            Chunk(1, "Deuxième chunk sans rapport."),
            Chunk(2, "Troisième chunk sans rapport."),
            Chunk(3, "Quatrième chunk qui ne doit pas apparaître."),
        };

        // Mots > 3 caractères présents dans le query, mais aucun ne matche le contenu des chunks
        var result = ChatService.ScoreAndSelectChunks(chunks, "Disponibilités tarifs garantie");

        Assert.NotNull(result);
        Assert.Contains("Premier chunk", result);
        Assert.Contains("Deuxième chunk", result);
        Assert.Contains("Troisième chunk", result);
        Assert.DoesNotContain("Quatrième chunk", result);
    }

    [Fact]
    public void MotAvecAccentDansLeChunk_MatcheRequeteSansAccent()
    {
        var chunks = new List<DocumentChunk>
        {
            Chunk(0, "Pour une réservation, contactez-nous une semaine à l'avance."),
            Chunk(1, "Autre chunk sans rapport avec le sujet."),
        };

        // Le visiteur tape sans accent — doit quand même matcher "réservation"
        var result = ChatService.ScoreAndSelectChunks(chunks, "Comment faire une reservation ?");

        Assert.NotNull(result);
        Assert.Contains("réservation", result);
        Assert.DoesNotContain("Autre chunk", result);
    }
}
