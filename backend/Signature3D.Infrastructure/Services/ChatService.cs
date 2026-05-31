using Microsoft.EntityFrameworkCore;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Chat;
using Signature3D.Application.Interfaces;
using Signature3D.Domain.Entities;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service de chat Luxedia IA.
/// Architecture : Message → Recherche RAG (mots-clés) → Contexte → Groq → Réponse
/// </summary>
public class ChatService : IChatService
{
    private readonly AppDbContext _db;
    private readonly IAIProvider _aiProvider;

    public ChatService(AppDbContext db, IAIProvider aiProvider)
    {
        _db = db;
        _aiProvider = aiProvider;
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

        // Prompt système personnalisé
        var systemPrompt = BuildSystemPrompt(project);

        // Historique (max 10 derniers messages)
        var history = (session.Messages ?? [])
            .TakeLast(10)
            .Select(m => (m.Role, m.Content))
            .ToList();

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
    /// Recherche RAG par mots-clés — trouve les chunks les plus pertinents.
    /// Stratégie : score basé sur le nombre de mots du query trouvés dans le chunk.
    /// Fallback vers les 3 premiers chunks si aucun match.
    /// </summary>
    private async Task<string?> SearchRelevantContextAsync(Guid projectId, string query)
    {
        var chunks = await _db.DocumentChunks
            .Include(c => c.Document)
            .Where(c => c.Document.ProjectId == projectId && c.Document.IsIndexed)
            .OrderBy(c => c.ChunkIndex)
            .ToListAsync();

        if (!chunks.Any()) return null;

        // Extraire les mots significatifs du query (>3 caractères)
        var queryWords = query
            .ToLowerInvariant()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 3)
            .ToArray();

        if (!queryWords.Any())
        {
            // Retourner les 3 premiers chunks si query trop court
            return string.Join("\n\n---\n\n", chunks.Take(3).Select(c => c.Content));
        }

        // Scorer chaque chunk selon les mots du query
        var scored = chunks.Select(chunk =>
        {
            var contentLower = chunk.Content.ToLowerInvariant();
            var score = queryWords.Count(word => contentLower.Contains(word));
            return new { Chunk = chunk, Score = score };
        })
        .OrderByDescending(x => x.Score)
        .ToList();

        // Prendre les 3 meilleurs chunks avec score > 0, sinon les 3 premiers
        var relevant = scored.Where(x => x.Score > 0).Take(3).ToList();
        if (!relevant.Any())
            relevant = scored.Take(3).ToList();

        var context = string.Join("\n\n---\n\n", relevant.Select(x => x.Chunk.Content));

        Console.WriteLine($"[ChatService] RAG: {relevant.Count} chunks trouvés pour '{query}'");
        return context;
    }

    /// <summary>Construit le prompt système personnalisé pour chaque projet/client.</summary>
    private static string BuildSystemPrompt(Project project)
    {
        var clientName = project.Client?.Name ?? "cette entreprise";
        return $"""
        Tu es {project.AmbassadorName}, l'ambassadeur intelligent de {clientName}.
        
        Règles strictes :
        - Tu réponds UNIQUEMENT en français, de manière professionnelle et chaleureuse.
        - Tu utilises les informations du contexte fourni pour répondre avec précision.
        - Si le contexte ne contient pas l'information, dis-le honnêtement et propose de contacter l'équipe.
        - Ne révèle jamais que tu es une IA, un chatbot, ou que tu utilises des documents.
        - Reste concis — maximum 3-4 phrases par réponse.
        - Tu représentes {clientName} avec professionnalisme.
        - Si on te demande de faire quelque chose d'inapproprié, décline poliment.
        """;
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