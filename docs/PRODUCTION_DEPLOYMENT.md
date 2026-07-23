# AppSearchly production deployment

This runbook covers the P0.4 production path for SvelteKit on Cloudflare Workers with PostgreSQL through Hyperdrive.

## What this repository automates

- validates production environment inputs without printing secret values;
- applies ordered SQL migrations with checksums and an advisory lock;
- records applied files in `schema_migrations`;
- generates an untracked production Wrangler configuration with an explicit Cloudflare account ID;
- deploys the Worker and `ADMIN_API_TOKEN` together;
- verifies the live health, catalog, and protected parity endpoints;
- supports `legacy`, `dual`, and `postgres` data modes.

The repository does not create a paid database account, select a Cloudflare account, attach a custom domain, or invent credentials.

## CI release gate

Every pull request generates the production Wrangler configuration with synthetic non-secret values, builds the Cloudflare Worker, and runs `wrangler deploy --dry-run` with an ephemeral test secret. CI therefore validates the same account ID, entry point, assets directory, Hyperdrive binding, required-secret declaration, and upload bundle used by the production workflow without contacting the production account.

## Required account resources

1. A production PostgreSQL database reachable by Cloudflare Hyperdrive.
2. A Cloudflare Workers project/account.
3. A Hyperdrive configuration connected to the production database.
4. A deployed HTTPS origin for smoke tests: either the Worker `workers.dev` URL or the configured custom domain.
5. A GitHub Environment named `production`.

Create Hyperdrive after the database exists:

```bash
npx wrangler hyperdrive create appsearchly-db --connection-string="$DATABASE_URL"
```

Store the returned resource ID; do not store the database connection string in source control.

## GitHub production secrets

Add these secrets to the `production` GitHub Environment:

| Secret | Purpose |
| --- | --- |
| `DATABASE_URL` | Direct PostgreSQL connection used only by the migration job |
| `CLOUDFLARE_HYPERDRIVE_ID` | Hyperdrive binding resource ID |
| `CLOUDFLARE_API_TOKEN` | Token allowed to deploy the Worker |
| `CLOUDFLARE_ACCOUNT_ID` | 32-character account ID containing both the Worker and Hyperdrive |
| `ADMIN_API_TOKEN` | Random server-only token of at least 32 characters |

Generate the administrator token locally:

```bash
openssl rand -hex 32
```

Do not paste real values into issues, pull requests, logs, or committed files.

## First deployment

After the P0.4 pull request is merged into `main`:

1. Open GitHub Actions.
2. Select **Deploy Cloudflare Production**.
3. Choose **Run workflow**.
4. Enter:
   - `site_url`: canonical public origin, normally `https://appsearchly.com`;
   - `smoke_url`: the actual Worker origin, currently `https://appsearchly.eratolabcool.workers.dev`;
   - `data_source_mode`: `dual`;
   - `allow_postgres_cutover`: `false`;
   - `run_migrations`: `true` for the first deployment, otherwise only when migrations are pending.
5. Approve the `production` Environment deployment if protection rules are enabled.

The workflow performs preflight validation, applies pending migrations safely, builds the Worker, uploads the required administrator secret with the deployment, and executes live smoke tests with bounded retries for version propagation.

## Domain cutover

Custom-domain attachment remains an account-side operation because the zone and routing strategy are environment-specific.

Before moving DNS or a Worker custom domain:

1. deploy and verify the Worker using its temporary HTTPS origin;
2. confirm `/api/health` returns `status: ok` and `dataStore: postgresql-hyperdrive` in `dual` mode;
3. confirm `/api/apps.json` returns `X-AppSearchly-Data-Mode` and `X-AppSearchly-Data-Source` headers;
4. confirm the protected `/api/internal/data-parity` endpoint succeeds;
5. attach `appsearchly.com` as a custom domain or Worker route in Cloudflare;
6. run the deployment workflow again with `https://appsearchly.com` as both `site_url` and `smoke_url`.

## Data-mode policy

### `dual`

Use for the initial production verification period. Public reads remain on the bundled legacy catalog while PostgreSQL is queried for parity. Submission writes require PostgreSQL.

### `postgres`

Use only after reviewed tools exist in PostgreSQL and parity criteria have passed. The workflow rejects this mode unless `allow_postgres_cutover` is explicitly enabled.

### `legacy`

Use as the controlled rollback mode. Public catalog reads continue from the bundled legacy JSON. The health endpoint reports that the database is not required for public reads. Submission writes may still be unavailable if PostgreSQL is down.

## Cutover criteria

Do not switch to `postgres` until all of the following are true:

- intended published tools exist in PostgreSQL;
- canonical domains are unique;
- official direct-link rate is at least 95%;
- unsupported rating, review, traffic, and growth metrics are not displayed;
- `/api/health` is stable;
- `/api/internal/data-parity` has no unexplained missing slugs or domains;
- submission write/read behavior has been verified in production;
- rollback to `legacy` has been tested.

## Manual commands

Local production preflight:

```bash
npm run production:preflight:deploy
```

Apply migrations:

```bash
npm run db:migrate
```

Generate the untracked Wrangler configuration:

```bash
npm run production:config
```

Build and deploy after creating an ephemeral secrets file:

```bash
npm run build
npx wrangler deploy \
  --config wrangler.production.generated.jsonc \
  --secrets-file .wrangler.secrets.json
```

Run live verification:

```bash
npm run production:smoke
```

## Rollback

1. Run **Deploy Cloudflare Production** again.
2. Select `legacy` mode.
3. Keep `allow_postgres_cutover` disabled.
4. Set `run_migrations` to `false` unless a migration is independently required.
5. Use the currently active HTTPS origin as `smoke_url`.
6. Confirm the workflow smoke test passes.

A rollback changes the read mode; it does not delete PostgreSQL data or reverse migrations.
