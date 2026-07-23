# AppSearchly

AppSearchly is an AI tool discovery and decision platform. The product is being rebuilt from a static directory into a maintainable system for verified tool data, search, comparisons, trend tracking, submissions, and transparent commercial listings.

## Product direction

AppSearchly is not intended to be a thin clone of another directory. Its long-term advantages should come from:

- verified official URLs and source-backed product data;
- task-oriented search and recommendation;
- explainable comparisons and alternatives;
- pricing, feature, availability, and product-change history;
- transparent separation between organic ranking and sponsored placement;
- useful distribution and analytics for tool founders.

The full product roadmap is tracked in [Issue #1](https://github.com/eratolabcool/appsearchly/issues/1). The current foundation work is tracked in [Issue #2](https://github.com/eratolabcool/appsearchly/issues/2).

## Current state

The repository currently contains a SvelteKit application with:

- a homepage and category discovery pages;
- search and tool detail routes;
- submission and administrative prototypes;
- an initial JSON dataset of AI tools;
- static deployment configuration.

This is an early migration state. The current JSON storage and dynamic API prototypes are not the target production architecture.

## P0 priorities

1. Establish clean, independently maintained project code and documentation.
2. Introduce a canonical tool data contract and source/provenance rules.
3. Audit and clean the existing dataset.
4. Move persistent submissions and analytics to PostgreSQL.
5. render tool content server-side with correct SEO and HTTP behavior.
6. Add CI, monitoring, sitemap, robots, and deployment checks.

See [`docs/P0_ARCHITECTURE.md`](docs/P0_ARCHITECTURE.md) and [`docs/DATA_POLICY.md`](docs/DATA_POLICY.md).

## Development

Requirements:

- Node.js 18 or newer
- npm

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run lint
npm run check
npm run build
npm run audit:data
```

`npm run audit:data` reports dataset quality problems without modifying source data.

## Data principles

- A tool's `officialUrl` must point to the tool owner, not another directory.
- Traffic, rating, review, pricing, and growth values require a source and observation time.
- Unknown values are stored as `null`; they are never replaced with invented numbers.
- Sponsored placement must be labeled and must not alter organic quality scores.
- Every published tool must have a last verification time.

## Repository safety

Do not commit:

- third-party proprietary source code or production bundles;
- copied fonts, logos, screenshots, or other assets without usage rights;
- secrets or production environment files;
- generated build output or `node_modules`;
- scraped personal contact details that are not intended for publication.

Security reports should follow [`SECURITY.md`](SECURITY.md).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before changing the data model, ranking logic, crawling behavior, or SEO templates.

## License status

A project-wide open-source license has not yet been selected. Contributions remain subject to repository ownership and applicable third-party licenses until the clean-room review is complete.