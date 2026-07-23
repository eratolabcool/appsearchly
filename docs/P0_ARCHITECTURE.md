# P0 Architecture

## Decision

AppSearchly will move from a static JSON-backed prototype to a server-rendered application with durable storage and asynchronous maintenance jobs.

The preferred production target is:

- SvelteKit application runtime;
- Cloudflare Workers deployment;
- PostgreSQL as the system of record;
- R2-compatible object storage for logos, screenshots, and crawl evidence;
- queue workers for crawl, verification, and enrichment jobs;
- scheduled jobs for dead-link, pricing, and freshness checks;
- PostgreSQL full-text and trigram search during the initial growth stage.

The runtime migration will be delivered separately from this foundation PR because it requires dependency, environment, deployment, and database changes to land together.

## Current architecture problems

### Static runtime with dynamic behavior

The repository uses a static adapter while also defining POST endpoints and local JSON writes. Production serverless filesystems are not durable application storage. Submission, review, payment, and analytics data must not depend on repository files at runtime.

### Whole-dataset client loading

Tool pages currently load the full tools collection in the browser. Core page content must be loaded by a server or build-time data function so that:

- the initial HTML contains the tool name and description;
- a missing slug returns a real 404;
- one tool request does not download the entire dataset;
- metadata and structured data are deterministic.

### Mixed data contracts

The code uses overlapping names such as `name` and `appName`, `platform` and `platforms`, and `priceType` and `pricingModel`. P0 introduces one canonical contract before database migration.

## Target modules

```text
src/lib/domain/          canonical entities and scoring rules
src/lib/server/db/       database client and repositories
src/lib/server/crawl/    extraction and normalization
src/lib/server/search/   search indexing and query logic
src/lib/server/events/   analytics and outbound events
src/routes/admin/        review and publishing workflow
scripts/                 migration and audit commands
```

## Initial database tables

- `tools`
- `tool_sources`
- `tool_snapshots`
- `categories`
- `tags`
- `tool_tags`
- `pricing_plans`
- `submissions`
- `outbound_clicks`
- `search_events`
- `tool_claims`

Every externally observed value must retain source metadata either on the record or in a snapshot.

## Migration sequence

1. Freeze the existing JSON dataset as an import source.
2. Audit duplicates, invalid URLs, aggregator links, and unsupported metrics.
3. Introduce the canonical TypeScript contract.
4. Create PostgreSQL schema and migration tooling.
5. Import clean records with source confidence and verification timestamps.
6. Replace file-backed reads with repository functions.
7. Replace browser-only tool loading with server-side loading.
8. Replace local file writes with submission and review tables.
9. Add queues and scheduled verification.
10. Remove obsolete JSON storage code after parity checks.

## Definition of done for P0

- Production and CI builds pass.
- No runtime feature writes to repository JSON.
- Tool pages render meaningful HTML before client JavaScript.
- Missing tools return HTTP 404.
- Published records use official URLs.
- Unsupported ratings and traffic figures are not displayed.
- Sitemap, robots, canonical metadata, and structured data are valid.
- Submissions can be reviewed and published through durable storage.
- Data freshness and source confidence are visible internally.