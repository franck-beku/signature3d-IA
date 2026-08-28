using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Chat;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de chat Luxedia IA.
/// Architecture : Message → Recherche RAG hybride (vectorielle si des embeddings existent
/// pour le projet, repli mots-clés sinon) → Contexte → Groq → Réponse
/// </summary>
public class ChatService : IChatService
{
    private readonly AppDbContext _db;
    private readonly IAIProvider _aiProvider;
    private readonly IMemoryCache _cache;
    private readonly IEmbeddingProvider _embeddingProvider;

    private static readonly TimeSpan ChunkCacheDuration = TimeSpan.FromMinutes(3);

    // Quota par document (au plus ce nombre de chunks retenus par document) puis plafond
    // global sur le pool résultant — empêche un document volumineux (beaucoup de chunks)
    // de noyer un document plus petit mais plus pertinent, uniquement parce qu'il a plus
    // de chunks en lice dans un tri global par pertinence.
    private const int PerDocumentChunkLimit = 3;
    private const int MaxContextChunks = 6;

    public ChatService(AppDbContext db, IAIProvider aiProvider, IMemoryCache cache, IEmbeddingProvider embeddingProvider)
    {
        _db = db;
        _aiProvider = aiProvider;
        _cache = cache;
        _embeddingProvider = embeddingProvider;
    }

    /// <summary>Traite un message visiteur et retourne la réponse de Luxedia.</summary>
    public async Task<Result<ChatResponseDto>> SendMessageAsync(ChatMessageDto dto)
    {
        // Charger le projet avec ses boutons et son client
        var project = await _db.Projects
            .Include(p => p.Buttons.OrderBy(b => b.Order))
            .Include(p => p.Client)
            .FirstOrDefaultAsync(p => p.Slug == dto.ProjectSlug);

        if (project is null)
            return Result<ChatResponseDto>.Fail("Projet introuvable.");

        // Luxedia désactivée pour ce projet (widget masqué côté UI) — un appel direct à cet
        // endpoint ne doit pas continuer à répondre comme si elle était active. Un projet
        // IAOnly a toujours LuxediaEnabled=true (garde-fou à l'écriture dans ProjectService),
        // donc cette vérification unique couvre aussi bien "IAOnly ⇒ toujours actif" que
        // "immersif + Luxedia désactivée ⇒ chat refusé", sans avoir à distinguer ExperienceType.
        if (!project.LuxediaEnabled)
            return Result<ChatResponseDto>.Fail("Assistant Luxedia désactivé pour ce projet.");

        // Récupérer ou créer la session
        ChatSession session;
        if (!string.IsNullOrEmpty(dto.SessionToken))
        {
            session = await _db.ChatSessions
                .Include(s => s.Messages.OrderBy(m => m.CreatedAt))
                .FirstOrDefaultAsync(s => s.SessionToken == dto.SessionToken)
                ?? await CreateAndSaveSessionAsync(project.Id);
        }
        else
        {
            session = await CreateAndSaveSessionAsync(project.Id);
        }

        // Recherche RAG — chunks pertinents par mots-clés
        var context = await SearchRelevantContextAsync(project.Id, dto.Message);

        // Prompt système personnalisé — la langue explicitement choisie par le visiteur dans le
        // widget (s'il a cliqué FR/EN) prime sur le réglage par défaut LuxediaLanguage de l'admin.
        var systemPrompt = BuildSystemPrompt(project, dto.VisitorLanguage);

        // Historique (max 10 derniers messages)
        var history = (session.Messages ?? [])
            .TakeLast(10)
            .Select(m => (m.Role, m.Content))
            .ToList();

        // Le tour courant (la question qu'on traite) n'est pas encore persisté —
        // il faut l'ajouter explicitement comme dernier tour "user" envoyé au modèle.
        history.Add(("user", dto.Message));

        // Appel au provider IA (Groq)
        var aiResult = await _aiProvider.GenerateResponseAsync(systemPrompt, history, context);
        if (!aiResult.Success)
            return Result<ChatResponseDto>.Fail(aiResult.Error!);

        // Sauvegarder les messages
        _db.ChatMessages.AddRange(
            new ChatMessage { ChatSessionId = session.Id, Role = "user",      Content = dto.Message },
            new ChatMessage { ChatSessionId = session.Id, Role = "assistant", Content = aiResult.Data! }
        );
        await _db.SaveChangesAsync();

        return Result<ChatResponseDto>.Ok(new ChatResponseDto
        {
            Response     = aiResult.Data!,
            SessionToken = session.SessionToken,
            Buttons      = project.Buttons.Select(b => new SuggestedButtonDto
            {
                Label  = b.Label,
                Url    = b.Url,
                Action = b.Action.ToString().ToLower()
            }).ToList()
        });
    }

    /// <summary>
    /// Recherche RAG hybride : tente d'abord la similarité vectorielle (pgvector) si l'embedding
    /// de la question peut être généré ET qu'au moins un chunk du projet a déjà un embedding.
    /// Repli intégral sur le scoring par mots-clés sinon (Gemini indisponible, aucun chunk
    /// embeddé pour ce projet, ou toute autre erreur) — le RAG ne doit jamais échouer totalement.
    /// </summary>
    private async Task<string?> SearchRelevantContextAsync(Guid projectId, string query)
    {
        try
        {
            var embeddingResult = await _embeddingProvider.GenerateEmbeddingAsync(query);
            if (embeddingResult.Success)
            {
                var queryVector = new Vector(embeddingResult.Data!);
                var vectorChunks = await SearchByVectorAsync(projectId, queryVector);
                if (vectorChunks.Count > 0)
                {
                    Console.WriteLine($"[ChatService] RAG vectoriel : {vectorChunks.Count} chunks trouvés pour '{query}'");
                    return string.Join("\n\n---\n\n", vectorChunks.Select(c => c.Content));
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ChatService] ⚠️ Recherche vectorielle indisponible, repli mots-clés : {ex.Message}");
        }

        // Repli — chemin mots-clés existant, inchangé.
        var chunks = await _cache.GetOrCreateAsync(RagCacheKeys.ForProject(projectId), async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = ChunkCacheDuration;
            return await _db.DocumentChunks
                .Include(c => c.Document)
                .Where(c => c.Document.ProjectId == projectId && c.Document.IsIndexed && !c.Document.IsInternal)
                .OrderBy(c => c.ChunkIndex)
                .ToListAsync();
        });

        if (chunks is null || !chunks.Any()) return null;

        return ScoreAndSelectChunks(chunks, query);
    }

    /// <summary>
    /// Recherche par similarité cosinus (pgvector, opérateur &lt;=&gt;) — requête SQL directe,
    /// pas via le cache mémoire des chunks (le classement doit se faire côté Postgres).
    /// Retourne une liste vide si aucun chunk du projet n'a encore d'embedding — c'est ce signal
    /// (liste vide) qui déclenche le repli vers la recherche par mots-clés.
    /// </summary>
    private async Task<List<DocumentChunk>> SearchByVectorAsync(Guid projectId, Vector queryEmbedding)
    {
        var candidates = await _db.DocumentChunks
            .Where(c => c.Document.ProjectId == projectId && c.Document.IsIndexed
                     && !c.Document.IsInternal && c.Embedding != null)
            .Select(c => new { Chunk = c, Distance = c.Embedding!.CosineDistance(queryEmbedding) })
            .OrderBy(x => x.Distance)
            .ToListAsync();

        // Quota par document puis re-tri global et plafond — voir PerDocumentChunkLimit/MaxContextChunks.
        return candidates
            .GroupBy(x => x.Chunk.DocumentId)
            .SelectMany(g => g.Take(PerDocumentChunkLimit))
            .OrderBy(x => x.Distance)
            .Take(MaxContextChunks)
            .Select(x => x.Chunk)
            .ToList();
    }

    /// <summary>
    /// Scoring RAG pur — sans accès DB, testable isolément avec une liste de chunks en mémoire.
    /// Stratégie : score basé sur le nombre de mots du query trouvés dans le chunk.
    /// Fallback vers les 3 premiers chunks (ordre d'entrée, ex. ChunkIndex) si aucun match
    /// ou si le query ne contient aucun mot de plus de 3 caractères.
    /// </summary>
    internal static string? ScoreAndSelectChunks(List<DocumentChunk> chunks, string query)
    {
        // Extraire les mots significatifs du query (>3 caractères) — normalisés (minuscules
        // + accents supprimés) pour matcher indépendamment de la casse et des accents.
        var queryWords = TextNormalizer.Normalize(query)
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 3)
            .ToArray();

        if (!queryWords.Any())
        {
            // Query trop court — appliquer quand même le quota par document plutôt qu'un Take brut.
            var fallback = chunks
                .GroupBy(c => c.DocumentId)
                .SelectMany(g => g.Take(PerDocumentChunkLimit))
                .Take(MaxContextChunks);
            return string.Join("\n\n---\n\n", fallback.Select(c => c.Content));
        }

        // Scorer chaque chunk selon les mots du query — le contenu original (non normalisé)
        // reste utilisé pour le contexte final envoyé au LLM, seule la comparaison est normalisée.
        var scored = chunks.Select(chunk =>
        {
            var normalizedContent = TextNormalizer.Normalize(chunk.Content);
            var score = queryWords.Count(word => ContainsApprox(normalizedContent, word));
            return new { Chunk = chunk, Score = score };
        })
        .OrderByDescending(x => x.Score)
        .ToList();

        // Prendre les chunks avec score > 0 (sinon tous), puis quota par document + plafond —
        // voir PerDocumentChunkLimit/MaxContextChunks (même logique que le chemin vectoriel).
        var withMatches = scored.Where(x => x.Score > 0).ToList();
        var pool = withMatches.Any() ? withMatches : scored;

        var relevant = pool
            .GroupBy(x => x.Chunk.DocumentId)
            .SelectMany(g => g.Take(PerDocumentChunkLimit))
            .OrderByDescending(x => x.Score)
            .Take(MaxContextChunks)
            .ToList();

        var context = string.Join("\n\n---\n\n", relevant.Select(x => x.Chunk.Content));

        Console.WriteLine($"[ChatService] RAG: {relevant.Count} chunks trouvés pour '{query}'");
        return context;
    }

    /// <summary>
    /// Correspondance tolérante aux petites variations (pluriel/singulier, faute de frappe en fin
    /// de mot — ex. "douvertures" pour "douverture") : après l'échec d'un Contains strict, on
    /// retente avec un préfixe du mot plutôt que le mot entier. Reste volontairement simple (pas
    /// de vraie recherche floue par distance d'édition) — c'est un filet de sécurité pour le repli
    /// mots-clés, pas le chemin de recherche principal (vectoriel, déjà robuste à ce type d'écart).
    /// </summary>
    private static bool ContainsApprox(string content, string word)
    {
        if (content.Contains(word)) return true;
        if (word.Length <= 4) return false; // trop court pour tronquer sans perdre le sens

        var prefixLength = Math.Max(4, word.Length - 2);
        var prefix = word[..Math.Min(prefixLength, word.Length)];
        return content.Contains(prefix);
    }

    /// <summary>
    /// Construit le prompt système personnalisé pour chaque projet/client.
    /// <paramref name="visitorLanguage"/> — langue explicitement choisie par le visiteur via le
    /// sélecteur FR/EN du widget ; prime sur project.LuxediaLanguage (valeur par défaut de l'admin,
    /// utilisée tant que le visiteur n'a pas cliqué sur le sélecteur).
    /// </summary>
    private static string BuildSystemPrompt(Project project, string? visitorLanguage = null)
    {
        var clientName = project.Client?.Name ?? "cette entreprise";
        var effectiveLanguage = !string.IsNullOrWhiteSpace(visitorLanguage) ? visitorLanguage : project.LuxediaLanguage;

        var languageInstruction = effectiveLanguage switch
        {
            "fr" => "- Tu réponds TOUJOURS en français, de manière professionnelle et chaleureuse, quelle que soit la langue du visiteur.",
            "en" => "- Respond ALWAYS in English, in a professional and warm manner, regardless of the visitor's language.",
            _    => "- Réponds toujours dans la même langue que celle utilisée par le visiteur dans son message (français ou anglais), de manière professionnelle et chaleureuse.",
        };

        // Coordonnée de repli — instruction de comportement, pas un texte figé : Luxedia formule
        // elle-même la phrase selon le contexte de la conversation.
        var hasContactPhone = !string.IsNullOrWhiteSpace(project.ContactPhone);
        var hasContactUrl   = !string.IsNullOrWhiteSpace(project.ContactUrl);
        var fallbackInstruction = hasContactPhone || hasContactUrl
            ? "Si le contexte ne contient pas l'information demandée, dis-le honnêtement et invite le visiteur à contacter "
              + clientName + " directement"
              + (hasContactPhone ? $" au {project.ContactPhone}" : "")
              + (hasContactPhone && hasContactUrl ? " ou" : "")
              + (hasContactUrl ? $" via {project.ContactUrl}" : "")
              + "."
            : "Si le contexte ne contient pas l'information, dis-le honnêtement et propose de contacter l'équipe.";

        var prompt = $"""
        Tu es {project.AmbassadorName}, l'ambassadeur intelligent de {clientName}.

        Règles strictes :
        {languageInstruction}
        - Tu utilises les informations du contexte fourni pour répondre avec précision.
        - {fallbackInstruction}
        - Ne révèle jamais que tu es une IA, un chatbot, ou que tu utilises des documents.
        - Reste concis — maximum 3-4 phrases par réponse.
        - Tu représentes {clientName} avec professionnalisme.
        - Si on te demande de faire quelque chose d'inapproprié, décline poliment.
        """;

        if (!string.IsNullOrWhiteSpace(project.LuxediaTone))
            prompt += $"\n- Adopte un ton {project.LuxediaTone}.";

        if (!string.IsNullOrWhiteSpace(project.LuxediaPersonalityInstructions))
            prompt += $"\n\nInstructions supplémentaires : {project.LuxediaPersonalityInstructions}";

        return prompt;
    }

    private async Task<ChatSession> CreateAndSaveSessionAsync(Guid projectId)
    {
        var session = new ChatSession
        {
            ProjectId    = projectId,
            SessionToken = Guid.NewGuid().ToString(),
            Messages     = []
        };
        _db.ChatSessions.Add(session);
        await _db.SaveChangesAsync();
        return session;
    }
}