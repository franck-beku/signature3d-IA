using Microsoft.AspNetCore.Mvc;
using Signature3D.Application.DTOs.Chat;
using Signature3D.Application.Interfaces;

namespace Signature3D.Api.Controllers;

/// <summary>
/// Controller du chatbot Luxedia IA.
/// Reçoit les messages des visiteurs depuis l'interface embed et retourne les réponses.
/// Route : /api/chat
/// Endpoint public — les visiteurs n'ont pas besoin de s'authentifier.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    /// <summary>
    /// Envoie un message à Luxedia et retourne sa réponse.
    /// POST /api/chat/message
    /// Body : { "message": "Quel est le prix?", "projectSlug": "mercedes-cle", "sessionToken": "..." }
    /// Public — appelé depuis l'interface embed par les visiteurs.
    /// </summary>
    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "Message vide." });

        if (string.IsNullOrWhiteSpace(dto.ProjectSlug))
            return BadRequest(new { message = "Slug du projet manquant." });

        var result = await _chatService.SendMessageAsync(dto);

        if (!result.Success)
            return BadRequest(new { message = result.Error });

        return Ok(result.Data);
    }
}