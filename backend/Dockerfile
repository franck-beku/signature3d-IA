# ════════════════════════════════════════════════════════════════
# Dockerfile — Signature3D.Api (.NET 9) pour Railway
# À placer à la RACINE du dossier backend/
# (au même niveau que Signature3D.Api/, Signature3D.Domain/, etc.)
# ════════════════════════════════════════════════════════════════

# ── Étape 1 : build ──
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copie les .csproj d'abord (cache des dépendances)
COPY Signature3D.Domain/*.csproj         Signature3D.Domain/
COPY Signature3D.Application/*.csproj     Signature3D.Application/
COPY Signature3D.Infrastructure/*.csproj  Signature3D.Infrastructure/
COPY Signature3D.Api/*.csproj             Signature3D.Api/

# Restore basé sur le projet API (qui référence les autres)
RUN dotnet restore Signature3D.Api/Signature3D.Api.csproj

# Copie tout le code et publie
COPY . .
RUN dotnet publish Signature3D.Api/Signature3D.Api.csproj -c Release -o /app/publish

# ── Étape 2 : runtime (image légère) ──
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Railway fournit la variable PORT ; Kestrel doit écouter dessus sur 0.0.0.0
# (la variable ASPNETCORE_URLS est définie côté Railway, voir le guide)
EXPOSE 8080

ENTRYPOINT ["dotnet", "Signature3D.Api.dll"]