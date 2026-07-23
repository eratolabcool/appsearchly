# PostgreSQL and Cloudflare migration runbook

This document describes the controlled migration from `data/apps.json` to PostgreSQL. It is intentionally split into reversible stages. No stage may delete the legacy dataset until the production read path has been verified.

## Target runtime

- SvelteKit on Cloudflare Workers
- `@sveltejs/adapter-cloudflare`
- PostgreSQL as the source of truth
- Cloudflare Hyperdrive binding named `HYPERDRIVE`
- R2 for logos, screenshots, and crawl evidence in a later P0 batch

Cloudflare's current SvelteKit Workers setup generates a Worker entry under `.svelte-kit/cloudflare`, enables `nodejs_compat`, and uses the Cloudflare adapter. Hyperdrive supplies a PostgreSQL connection string through a Worker binding; database credentials must never be exposed through `VITE_` or `PUBLIC_` variables.

Official references:

- https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/
- https://developers.cloudflare.com/hyperdrive/get-started/
- https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/

## Stage 0: credential containment

1. Rotate any administrator password that has ever appeared in Git history or a `VITE_` variable.
2. Use a server-only `ADMIN_SESSION_SECRET` with at least 32 random bytes.
3. Do not put database credentials, admin credentials, API secrets, or email credentials in browser-exposed variables.
4. Review deployed Vercel and Cloudflare environment variables before the first database-enabled release.

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
- `quarantined`: the URL is invalid, points to an aggregator, or duplicates another canonical domain.

The preview deliberately drops legacy rating, review, traffic, growth, download, and conversion values. Those fields cannot be imported without an attributable source and timestamp.

## Stage 3: human review

Before writing to PostgreSQL:

1. Resolve every quarantined record to a direct official URL or reject it.
2. Confirm canonical domains and merge duplicates.
3. Rewrite copied descriptions in AppSearchly's own factual language.
4. Verify pricing status from an official source.
5. Require at least one source URL and source check timestamp.
6. Keep all imported tools in `needs_review`; do not publish during import.

## Stage 4: Cloudflare runtime switch

This is a separate PR because it changes dependency and deployment behavior.

Required changes:

1. Replace `@sveltejs/adapter-static` with `@sveltejs/adapter-cloudflare`.
2. Add Wrangler configuration with:
   - Worker main: `.svelte-kit/cloudflare/_worker.js`
   - assets directory: `.svelte-kit/cloudflare`
   - compatibility flag: `nodejs_compat`
   - a modern compatibility date
   - Hyperdrive binding: `HYPERDRIVE`
   - observability enabled
3. Add a PostgreSQL driver compatible with Hyperdrive.
4. Make `/api/health` perform a lightweight database query with a short timeout.
5. Keep the old JSON repository available behind a read-only fallback flag during verification.

Do not place the Hyperdrive ID or production connection string in committed application source if the repository may later become public. Use Cloudflare environment configuration.

## Stage 5: dual-read verification

For a limited verification period:

- PostgreSQL is the primary read source.
- Legacy JSON is read only for comparison and emergency rollback.
- Compare tool counts, slugs, category assignments, and generated canonical URLs.
- Record mismatches without automatically overwriting reviewed database records.
- Submission writes go only to PostgreSQL.

Exit criteria:

- 100% of published pages resolve from PostgreSQL;
- no duplicate canonical domains;
- official URL rate at least 95%;
- no unsupported metrics displayed;
- submission and review workflow survives a production deployment;
- rollback has been tested.

## Stage 6: remove legacy write paths

Only after dual-read verification:

1. Delete filesystem write helpers.
2. Disable `/api/apps.json` as the primary application data source.
3. Archive the original JSON as migration evidence outside the runtime bundle.
4. Enable strict import and data audits in CI.
5. Make type checking blocking after the legacy Svelte errors are resolved.

## Rollback

If the database-enabled deployment fails:

1. Revert traffic to the last static build.
2. Disable submission writes rather than accepting data that may be lost.
3. Preserve database records and migration logs.
4. Diagnose the Worker/Hyperdrive path without modifying the legacy JSON.
5. Redeploy only after CI, health checks, and a preview environment pass.
