# P0.5.2 Submission Pipeline

## Runtime flow

1. `POST /api/submissions` validates the payload.
2. Production requests must pass Cloudflare Turnstile.
3. The submitted URL must use HTTPS, must not target a private host, and must be reachable.
4. PostgreSQL checks blocked and duplicate domains.
5. IP and email submission limits are enforced without storing a plaintext IP address.
6. Deterministic quality scoring records website, trust, content, SEO, and security dimensions.
7. The submission, checks, and score are persisted in one database transaction.
8. Every accepted record remains in the editorial review queue; no automatic publication occurs.

## Production configuration

Create a Cloudflare Turnstile widget for `appsearchly.com`, then configure the GitHub `production` Environment:

- secret: `TURNSTILE_SECRET_KEY`
- variable: `PUBLIC_TURNSTILE_SITE_KEY`

Run the production deployment workflow with `run_migrations=true` for the first deployment after this migration.

## Security properties

- HTTPS only.
- Localhost and common private IPv4 ranges are rejected before fetch.
- Fetch timeout is bounded to five seconds.
- Duplicate domains are checked against both submissions and published/draft tools.
- Daily IP and monthly email limits are evaluated server-side.
- The raw IP address is never stored; only its SHA-256 digest is retained.
- A failed security check never creates a database record.
