using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Auth;

namespace Signature3D.Application.Interfaces;

/// <summary>
/// Service d'authentification JWT pour Alain et Franck.
/// </summary>
public interface IAuthService
{
    Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto);
    Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}