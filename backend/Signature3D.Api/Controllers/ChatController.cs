using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Signature3D.Application.Common;
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
    /// Limité à 10 requêtes/minute par IP (policy "chat").
    /// </summary>
    [HttpPost("message")]
    [EnableRateLimiting("chat")]
    public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "Message vide." });

        if (dto.Message.Length > AppConstants.MaxChatMessageLength)
        {
            Console.WriteLine($"[ChatController] ⚠️ Message rejeté (trop long, {dto.Message.Length} caractères) — slug={dto.ProjectSlug}");
            return BadRequest(new { message = $"Le message ne doit pas dépasser {AppConstants.MaxChatMessageLength} caractères." });
        }

        if (string.IsNullOrWhiteSpace(dto.ProjectSlug))
            return BadRequest(new { message = "Slug du projet manquant." });

        var result = await _chatService.SendMessageAsync(dto);

        if (!result.Success)
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = result.Error });

        return Ok(result.Data);
    }
}