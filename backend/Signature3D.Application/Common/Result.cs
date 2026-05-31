namespace Signature3D.Application.Common;

/// <summary>
/// Résultat générique retourné par tous les services.
/// Permet de gérer les succès et les erreurs de manière uniforme.
/// </summary>
public class Result<T>
{
    public bool Success { get; private set; }
    public T? Data { get; private set; }
    public string? Error { get; private set; }

    private Result(bool success, T? data, string? error)
    {
        Success = success;
        Data = data;
        Error = error;
    }

    public static Result<T> Ok(T data) => new(true, data, null);
    public static Result<T> Fail(string error) => new(false, default, error);
}

/// <summary>
/// Résultat sans données — pour les opérations void (delete, update).
/// </summary>
public class Result
{
    public bool Success { get; private set; }
    public string? Error { get; private set; }

    private Result(bool success, string? error)
    {
        Success = success;
        Error = error;
    }

    public static Result Ok() => new(true, null);
    public static Result Fail(string error) => new(false, error);
}