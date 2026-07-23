# PostgreSQL and Cloudflare migration runbook

This document describes the controlled migration from `data/apps.json` to PostgreSQL. It is intentionally split into reversible stages. No stage may delete the legacy dataset until the production read path has been verified.

## Target runtime

- SvelteKit on Cloudflare Workers
- `@sveltejs/adapter-cloudflare`
- PostgreSQL as the eventual source of truth
- Cloudflare Hyperdrive binding named `HYPERDRIVE`
- R2 for logos, screenshots, and crawl evidence in a later P0 batch

The Worker build uses `.svelte-kit/cloudflare/_worker.js`, the `nodejs_compat` compatibility flag, and the `pg` driver through Hyperdrive. Database credentials and administrator tokens must never use `VITE_` or `PUBLIC_` prefixes.

Official references:

- https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/
- https://developers.cloudflare.com/hyperdrive/get-started/
- https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/

## Stage 0: credential containment

1. Rotate any administrator password that has ever appeared in Git history or a `VITE_` variable.
2. Generate a server-only `ADMIN_API_TOKEN` with at least 32 random bytes.
3. Store the token with `wrangler secret put ADMIN_API_TOKEN`.
4. Do not put database credentials, admin credentials, API secrets, or email credentials in browser-exposed variables.
5. Review deployed Vercel and Cloudflare environment variables before the first database-enabled release.

A credential removed from the current branch still exists in Git history. Removing the file value is not a substitute for rotating the credential.

## Stage 1: create an empty database

Create a PostgreSQL database and apply the schema:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001_initial.sql
```

The migration enables `pgcrypto`, `citext`, and `pg_trgm`. The selected PostgreSQL provider must allow these extensions.

The migration must be run by an operator or CI migration job. Application startup must not silently create or mutate production tables.

## Stage 2: preview the legacy import

Generate a non-destructive preview:

```bash
npm run prepare:import
```

Output:

```text
tmp/tool-import-preview.json
```

Each legacy row is assigned one classification:

- `ready`: the record has a plausible direct official URL and enough core metadata;
- `needs_review`: the direct URL is acceptable, but content or provenance is incomplete;
- `quarantined`: the URL is invalid, points to an aggregator, uses a reserved placeholder domain, or duplicates another canonical domain.

The preview deliberately drops legacy rating, review, traffic, growth, download, and conversion values. Those fields cannot be imported without an attributable source and timestamp.

Current P0 preview findings:

- 91 total legacy records;
- 89 records point to `www.toolify.ai` instead of an official product domain;
- 2 records use reserved `example.com` placeholder domains;
- 362 unsupported metric fields are removed from import candidates;
- 0 records are safe for direct import without URL research.

## Stage 3: human review

Before writing tools to PostgreSQL:

1. Resolve every quarantined record to a direct official URL or reject it.
2. Confirm canonical domains and merge duplicates.
3. Rewrite copied descriptions in AppSearchly's own factual language.
4. Verify pricing status from an official source.
5. Require at least one source URL and source check timestamp.
6. Keep all imported tools in `needs_review`; do not publish during import.

## Stage 4: activate the Cloudflare runtime

P0.3 implements the application-side runtime:

- Cloudflare adapter and Worker output;
- Wrangler configuration and `nodejs_compat`;
- `pg` database client through `HYPERDRIVE.connectionString`;
- live `/api/health` database probe;
- PostgreSQL-backed submissions;
- server-only Bearer authorization for administrative APIs;
- read-only legacy fallback and data-parity reporting.

The remaining work is external resource provisioning:

1. Create a PostgreSQL database and apply the migration.
2. Create a Hyperdrive configuration for that database.
3. Add the returned Hyperdrive ID to the binding named `HYPERDRIVE` in the Cloudflare dashboard or deployment configuration.
4. Set `APP_ENV=production`.
5. Set `DATA_SOURCE_MODE=dual` for the verification period.
6. Add `ADMIN_API_TOKEN` as a Wrangler secret.
7. Deploy a preview and confirm `/api/health` reports `postgresql-hyperdrive`.

Do not commit a production connection string. A Hyperdrive resource ID may be configured in deployment configuration, but environment-specific values should remain outside reusable source whenever practical.

## Stage 5: dual-read verification

P0.3 deliberately defines three modes:

- `legacy`: serve only the bundled read-only JSON catalog;
- `dual`: continue serving legacy JSON while querying PostgreSQL for parity and falling back safely if the database is unavailable;
- `postgres`: serve published tools from PostgreSQL and fail closed if the database is unavailable.

Start production verification in `dual` mode. Submission writes always go to PostgreSQL and never fall back to a filesystem write.

Use the protected endpoint with the administrator Bearer token:

```text
GET /api/internal/data-parity
Authorization: Bearer <ADMIN_API_TOKEN>
```

Compare tool counts, slugs, canonical domains, category assignments, and generated canonical URLs. Do not automatically overwrite reviewed database records from legacy JSON.

Exit criteria before changing to `postgres`:

- all intended published tools exist in PostgreSQL;
- no duplicate canonical domains;
- official URL rate at least 95%;
- no unsupported metrics displayed;
- submission and review workflow survives a production deployment;
- health and parity endpoints are stable;
- rollback has been tested.

## Stage 6: remove legacy paths

Only after PostgreSQL verification:

1. Change `DATA_SOURCE_MODE` to `postgres`.
2. Confirm all public tool and category pages resolve from PostgreSQL.
3. Delete unused filesystem write helpers.
4. Retire `/api/apps.json` as a legacy-shaped contract or version it explicitly.
5. Archive the original JSON as migration evidence outside the runtime bundle.
6. Enable strict import and data audits in CI.
7. Make type checking blocking after remaining migration warnings are resolved.

## Rollback

If the database-enabled deployment fails:

1. Set `DATA_SOURCE_MODE=legacy` or redeploy the last known static release.
2. Disable submission writes rather than accepting data that may be lost.
3. Preserve database records and migration logs.
4. Diagnose the Worker/Hyperdrive path without modifying the legacy JSON.
5. Redeploy only after CI, health checks, and a preview environment pass.
