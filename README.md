# AppSearchly

AppSearchly is an AI tool discovery and comparison platform — a fast, friendly directory of AI tools with search, categories, rankings, and verified data.

**Live production:** https://www.appsearchly.com (Cloudflare Workers + Neon Postgres via Hyperdrive)

---

## Technology stack

| Layer | Tech |
|---|---|
| Frontend | SvelteKit 2 + Svelte 5 + TypeScript |
| Styling | Tailwind CSS 4 + design tokens (`src/app.css`) |
| Deployment | Cloudflare Workers (`@sveltejs/adapter-cloudflare`) |
| Database | PostgreSQL (Neon) through Cloudflare Hyperdrive (`appsearchly-db`) |
| Search | Server-side via unified data layer (SQL trigram when DB present) |
| Data | `data/apps.json` (legacy JSON) + Postgres (`tools`, `categories`, `submissions`, …) |
| Security | Turnstile CAPTCHA, admin Bearer token, submission quality checks |

## Architecture

```
www.appsearchly.com / appsearchly.com
        ↓  (Cloudflare zone routes)
   Worker (SvelteKit SSR)
        ↓
   data-access.ts  ←  unified read layer
     ├─ Hyperdrive → Neon Postgres (production)
     └─ data/apps.json fallback (no-DB local/dev)
```

**Key invariant:** every public read goes through `src/lib/server/data-access.ts`. With a Hyperdrive binding the site serves from Postgres; without one it serves the bundled JSON. Both modes are fully browsable.

## Local development

```bash
npm ci
npm run dev        # no database needed — JSON fallback kicks in automatically
```

Production build:

```bash
npm run build
npm run preview
```

Type checks & quality gates:

```bash
npm run check                 # svelte-check (0 errors expected)
npm run audit:data            # data quality audit
npm run test:acquisition      # acquisition engine tests
```

---

# Operations guide (运营指南)

## 1. Deploy to production

Prerequisites (already configured in this repo's environment):

- Cloudflare account with `appsearchly.com` zone
- Worker `appsearchly` with zone routes for `appsearchly.com` + `www.appsearchly.com`
- Hyperdrive config `appsearchly-db` → Neon Postgres
- Worker secrets: `ADMIN_API_TOKEN`, `TURNSTILE_SECRET_KEY`

Deploy:

```bash
# 1. Build (SvelteKit + write worker entry)
npm run build

# 2. Deploy with the production config
npx wrangler deploy --config wrangler.production.generated.jsonc
```

> `wrangler.production.generated.jsonc` is gitignored (contains the Turnstile site key). Keep its values in your local `.env`-style secret management.

### Rotating secrets

```bash
printf 'new-secret' | npx wrangler secret put ADMIN_API_TOKEN --config wrangler.production.generated.jsonc
printf 'new-secret' | npx wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.production.generated.jsonc
```

Update `PUBLIC_TURNSTILE_SITE_KEY` in `wrangler.production.generated.jsonc` if the Turnstile widget changes, then redeploy.

## 2. Database migrations & data import

### Apply schema migrations

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
npm run db:migrate
```

> If `0001_initial.sql` reports a checksum mismatch (file edited after it was applied), apply the remaining migrations manually:
> `node -e` … run `0003_submission_quality.sql` … `0007_acquisition_engine.sql` (they are idempotent `ADD COLUMN IF NOT EXISTS` scripts).

### Import the dataset into Postgres

`data/apps.json` is the source of truth for the public catalog. After editing it, re-import:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
node scripts/import-legacy-to-db.mjs
```

This truncates and rebuilds `tools`, `categories`, `features`, `pricing_plans` from the JSON (idempotent). Then redeploy.

### Acquire new tools (GitHub-sourced)

```bash
node --import tsx scripts/acquire-tools.ts --limit=20 --dry-run   # preview
node --import tsx scripts/acquire-tools.ts --limit=20             # merge into apps.json
```

The script: queries GitHub for high-star AI repos → filters out libraries/aggregators → crawls each homepage (respects robots.txt) → extracts metadata → dedupes → writes `data/apps.json` (with backup). No metrics are fabricated (`monthlyVisits`/`rating` stay null).

### Resolve official domains (toolify-linked tools)

```bash
node --import tsx scripts/resolve-official-domains.ts            # full run, resumable
```

Uses the Jina Reader proxy to bypass aggregator anti-bot, extracts the official website link, verifies reachability, and updates `data/apps.json`. Checkpointed in `data/backups/official-domains.jsonl`; failed tools are retried on the next run.

## 3. Reviewing submissions (审核流程)

Users submit tools via `/submit` (Turnstile-protected). Submissions land in the Postgres `submissions` table with quality scores.

### Review in the UI

1. Open https://www.appsearchly.com/admin/submissions
2. Enter the admin API token (stored locally in the browser)
3. Each item shows a quality score → **Approve & publish** or **Reject**
4. Approved tools are created as published `tools` records

Admin pages:

| URL | Purpose |
|---|---|
| `/admin/submissions` | Review queue |
| `/admin/tools` | Edit tool status / pricing / verification |
| `/admin/pipeline` | Acquisition pipeline dashboard (sources, imports, jobs) |

### Review via API

```bash
# List pending submissions
curl -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  https://www.appsearchly.com/api/admin/submissions

# Approve & publish
curl -X POST -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  https://www.appsearchly.com/api/admin/submissions/<id>/approve

# Reject
curl -X POST -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"not a product"}' \
  https://www.appsearchly.com/api/admin/submissions/<id>/reject
```

### Submission pipeline (server-side)

`src/lib/server/submission-pipeline.ts`: Turnstile verify → URL format/accessibility checks → domain blocklist → duplicate detection → rate limiting (IP + email) → quality scoring → persist. Errors map to HTTP 400/403/409/422/429/503.

## 4. Data quality policies

1. Tool links must resolve to direct official product domains (not aggregators like toolify.ai).
2. Ratings, traffic, growth, reviews, and pricing require a named source and timestamp — never fabricate.
3. Duplicate canonical domains are not published as separate tools.
4. Human review is required before a submitted tool is published.

Current catalog: **100 tools** (47 with resolved official domains; the remainder still link to aggregator pages pending manual research — see `docs/toolify-review.md`).

## 5. SEO & public endpoints

- `GET /sitemap.xml` — generated from the catalog (canonical `/tools/{slug}` URLs)
- `GET /robots.txt`
- JSON-LD structured data on tool detail pages (`SoftwareApplication` + `AggregateRating`)
- API: `/api/search`, `/api/tools`, `/api/tools/[slug]`, `/api/category/[slug]`, `/api/trending-apps`, `/api/featured-apps`

## 6. Environment & secrets

Never commit credentials. `.env*` is gitignored except `.env.example`. Worker secrets are set with `wrangler secret put`.

| Variable | Purpose | Exposed to browser? |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget key | Yes (public by design) |
| `TURNSTILE_SECRET_KEY` | Server-side Turnstile verify | No |
| `ADMIN_API_TOKEN` | Admin API Bearer auth (≥32 chars) | No |
| `DATABASE_URL` | Direct Postgres for migration/import scripts only | No |
| `HYPERDRIVE` (binding) | Worker → Postgres | No |

## Validation commands

```bash
npm run check               # svelte-check, expect 0 errors
npm run build               # production build + worker entry
npm run audit:data          # data quality audit
npm run test:acquisition    # acquisition engine tests
npm run db:migrate          # apply SQL migrations (needs DATABASE_URL)
```

## Data files

| File | Purpose |
|---|---|
| `data/apps.json` | Authoritative catalog (source of truth for imports) |
| `data/categories.json` | Category tree (roots + subcategories) |
| `data/backups/` | Automatic backups + resolution checkpoints |
| `scripts/acquire-tools.ts` | GitHub-sourced acquisition |
| `scripts/resolve-official-domains.ts` | Aggregator → official URL resolution |
| `scripts/import-legacy-to-db.mjs` | JSON → Postgres bulk import |

## Contributing

Read `CONTRIBUTING.md` before opening a pull request. Data additions must include direct official URLs and provenance evidence.

## Security

Report security problems using the process in `SECURITY.md`. Never commit secrets; any credential that ever appeared in Git history must be treated as compromised and rotated.
