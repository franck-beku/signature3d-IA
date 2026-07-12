namespace Signature3D.Application.DTOs.Documents;

/// <summary>
/// Résultat d'une passe de rattrapage des embeddings manquants sur les chunks existants.
/// </summary>
public class EmbeddingBackfillResultDto
{
    public int Processed { get; set; }
    public int Succeeded { get; set; }
    public int Failed { get; set; }
}
