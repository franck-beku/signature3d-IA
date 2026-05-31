using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Signature3D.Application.Common;
using Signature3D.Application.DTOs.Auth;
using Signature3D.Application.Interfaces;
using Signature3D.Infrastructure.Configurations;
using Signature3D.Infrastructure.Data;

namespace Signature3D.Infrastructure.Services;

/// <summary>
/// Service d'authentification JWT pour Alain et Franck.
/// Génère un token JWT valide après vérification email/mot de passe.
/// </summary>
public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtSettings _jwt;

    public AuthService(AppDbContext db, JwtSettings jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    /// <summary>
    /// Connecte un utilisateur et retourne un token JWT.
    /// </summary>
    public async Task<Result<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        // Chercher l'utilisateur par email
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);

        if (user is null)
            return Result<AuthResponseDto>.Fail("Email ou mot de passe incorrect.");

        // Vérifier le mot de passe hashé
        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Result<AuthResponseDto>.Fail("Email ou mot de passe incorrect.");

        // Générer le token JWT
        var token = GenerateToken(user.Id, user.Email, user.Name, user.Role);
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.ExpirationMinutes);

        return Result<AuthResponseDto>.Ok(new AuthResponseDto
        {
            Token = token,
            Name = user.Name,
            Email = user.Email,
            Role = user.Role,
            ExpiresAt = expiresAt
        });
    }

    /// <summary>
    /// Change le mot de passe d'un utilisateur.
    /// </summary>
    public async Task<Result> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user is null)
            return Result.Fail("Utilisateur introuvable.");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            return Result.Fail("Mot de passe actuel incorrect.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Result.Ok();
    }

    /// <summary>
    /// Génère un token JWT signé avec les claims de l'utilisateur.
    /// </summary>
    private string GenerateToken(Guid userId, string email, string name, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Name, name),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwt.ExpirationMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}