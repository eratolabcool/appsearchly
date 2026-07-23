# AppSearchly

AppSearchly is an independent AI tool discovery, comparison, and growth intelligence platform.

The product goal is not to publish the largest possible list of links. AppSearchly is being built around trustworthy source data, direct official URLs, explainable comparisons, and useful signals about how AI products change over time.

## Current status

The repository is in **P0 foundation work**. The current public interface is still backed by a legacy JSON dataset while the project establishes:

- a canonical tool data contract;
- data provenance and verification rules;
- PostgreSQL migrations and safe import tooling;
- reliable CI and production builds;
- server-rendered SEO foundations;
- a durable submission and review workflow;
- a later Cloudflare Workers + Hyperdrive runtime switch.

The legacy dataset is not considered production-quality source data. The current migration preview found 91 records, none of which are safe for direct import without official URL research.

## Technology

Current transition stack:

- SvelteKit
- TypeScript
- Vite
- static adapter during the P0 transition
- JSON legacy dataset in read-only migration mode

Target stack:

- SvelteKit on Cloudflare Workers
- PostgreSQL through Cloudflare Hyperdrive
- R2 for tool media and crawl evidence
- PostgreSQL full-text and trigram search initially

## Local development

```bash
npm ci
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Validation commands

```bash
npm run audit:data
npm run prepare:import
npm run check
npm run build
```

`npm run audit:data:strict` and `npm run prepare:import:strict` are intended for after the legacy dataset has been cleaned. Type checking remains a non-blocking CI diagnostic until the inherited Svelte errors are resolved.

The migration preview is written to:

```text
tmp/tool-import-preview.json
```

It never writes to PostgreSQL or modifies `data/apps.json`.

## Data principles

1. Tool links must resolve to direct official product domains.
2. Ratings, traffic, growth, reviews, and pricing require a named source and timestamp.
3. Sponsored exposure must not change organic quality scores.
4. Duplicate canonical domains are not published as separate tools.
5. Aggregator URLs and placeholder domains are quarantined during migration.
6. Human review is required before an imported tool is published.

See:

- `docs/DATA_POLICY.md`
- `docs/P0_ARCHITECTURE.md`
- `docs/DATABASE_MIGRATION.md`
- `db/migrations/0001_initial.sql`

## Security

Never commit credentials. Variables prefixed with `VITE_` or `PUBLIC_` may be exposed to browser code and must not contain secrets.

A previously committed administrator value has been removed from `.env.example`. Any credential that matched it must be rotated because deletion from the current branch does not remove it from Git history.

Report security problems using the process in `SECURITY.md`.

## Contributing

Read `CONTRIBUTING.md` before opening a pull request. Data additions must include direct official URLs and provenance evidence.

## Roadmap

The active roadmap is tracked in GitHub Issues:

- P0 foundation and data credibility
- independent collection and update pipeline
- search, comparison, and task-based discovery
- high-quality SEO page network
- explainable rankings and product-change intelligence
- founder submission, claim, and commercial tools

## License and provenance

AppSearchly must contain only independently authored code and assets or dependencies with clearly compatible licenses. Historical third-party production bundles and proprietary assets are not part of the intended product and must be removed during clean-room review.
