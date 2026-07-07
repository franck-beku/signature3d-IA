# Signature3D API — Backend

ASP.NET Core 9 (C#), Clean Architecture, PostgreSQL via Supabase. Voir le `CLAUDE.md` à la racine du workspace pour les commandes de build/migration et le détail de l'architecture par couche.

## Limitations connues

### Rate limiting — compteur en mémoire, par instance

Le endpoint chat public (`POST /api/chat`, ou équivalent) est protégé par un rate limiter ASP.NET Core natif (`AddRateLimiter`, voir `Signature3D.Api/Program.cs`) : 10 requêtes/minute par IP, fenêtre fixe.

**Ce compteur vit en mémoire dans le process** — il n'est pas partagé entre plusieurs instances. Tant que le service tourne sur **une seule instance** (déploiement Railway actuel), la limite de 10 req/min par IP est correctement appliquée.

**Si ce service est scalé horizontalement** (plusieurs instances derrière un load balancer sans affinité de session), la limite réelle devient N×10/min par IP — chaque instance applique sa propre limite indépendamment, sans coordination. Ce n'est pas un bug qui casse l'application : c'est un affaiblissement silencieux de la protection anti-abus, qui ne se manifeste que si/quand le service passe à plusieurs instances.

**Avant de scaler horizontalement**, deux options :
1. Accepter consciemment cette limite affaiblie (peut être raisonnable selon le trafic réel attendu).
2. Remplacer le rate limiter en mémoire par un compteur partagé. Option recommandée à l'échelle de ce projet : une table PostgreSQL (déjà disponible via Supabase, pas de nouvelle dépendance) avec une ligne par IP et une fenêtre fixe (reset du compteur quand la fenêtre expire), mise à jour via un `UPSERT` atomique — évite la croissance illimitée de la table et les races conditions. Redis (`INCR`+`EXPIRE`) reste une alternative plus simple à implémenter si une vraie dépendance externe devient acceptable à ce moment-là.

Ce choix a été fait consciemment (audit de scalabilité, 2026-07) plutôt que de sur-ingénierer une solution distribuée avant qu'un besoin multi-instance réel n'existe.
