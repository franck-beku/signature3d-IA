using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Chat;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service de chat — reçoit les messages visiteurs et génère les réponses Luxedia via RAG.
/// </summary>
public interface IChatService
{
    Task<Result<ChatResponseDto>> SendMessageAsync(ChatMessageDto dto);
}