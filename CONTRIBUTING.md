# Contributing to AppSearchly

## Before changing code

- Read `docs/P0_ARCHITECTURE.md` and `docs/DATA_POLICY.md`.
- Keep changes focused and avoid mixing visual redesigns with data or runtime migrations.
- Do not add copied third-party source, descriptions, rankings, reviews, fonts, logos, or production bundles.
- Do not introduce a second name for an existing canonical field.

## Local validation

```bash
npm ci
npm run audit:data
npm run check
npm run build
```

Use `npm run audit:data:strict` only after the legacy dataset has been cleaned enough to satisfy blocking rules.

## Data changes

A data change should explain:

- the official source URL;
- when the source was checked;
- whether the value is directly observed or inferred;
- why a category, tag, comparison, or alternative relationship is appropriate.

Do not add unverified traffic, growth, rating, review, pricing, or customer numbers.

## Schema changes

Changes to the canonical tool contract should include:

- migration impact;
- indexing impact;
- API and page impact;
- null and unknown behavior;
- provenance requirements;
- backward-compatibility or migration notes.

## Pull requests

A pull request should include:

- what changed;
- why it changed;
- user and operator impact;
- validation performed;
- follow-up work intentionally left out.

Keep pull requests small enough to review. P0 runtime, database, SSR, data cleaning, and large UI changes should be separate pull requests unless they cannot function independently.

## SEO safeguards

Do not publish programmatic pages merely because a URL can be generated. New page types need:

- a clear search intent;
- a minimum data threshold;
- unique decision value;
- canonical and indexing behavior;
- internal-linking rules;
- empty and low-quality states.