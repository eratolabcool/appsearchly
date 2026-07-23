# Data Quality and Provenance Policy

AppSearchly must be useful because its data is trustworthy, not because its pages contain large numbers of unverified fields.

## Publication requirements

A published tool must include:

- a stable internal ID;
- a unique slug;
- a normalized canonical domain;
- an official product URL;
- a name and concise original summary;
- one primary category;
- three to eight useful tags when available;
- a pricing status, including `unknown` when not verified;
- a publication status;
- a source type and source URL;
- a source check time;
- a last verification time;
- a data confidence value.

## Official URL rule

`officialUrl` must link to a website controlled by the product owner or its documented distribution page. It must not link to:

- another AI directory;
- an affiliate redirect whose final destination is unknown;
- a copied landing page;
- an unrelated company homepage when a product page exists.

Affiliate parameters may be applied only by the outbound redirect layer and must not replace the stored canonical URL.

## Unknown data

Unknown values are `null` or an explicit `unknown` enum value.

Do not infer or manufacture:

- user ratings;
- review counts;
- monthly traffic;
- growth percentages;
- pricing amounts;
- launch dates;
- customer counts;
- conversion rates.

A visually complete card is not more important than truthful data.

## Observed metrics

An observed metric requires:

- `value`;
- `sourceType`;
- `sourceUrl` or source identifier;
- `observedAt`;
- optional methodology notes;
- optional confidence.

Metrics should be stored as time-series observations rather than overwriting the previous value.

## Content rules

Descriptions should be original summaries based on official product information. Do not copy another directory's descriptions, rankings, reviews, or editorial conclusions.

Generated enrichment may propose categories, tags, summaries, and comparisons, but publication requires validation against source material.

## Ratings and reviews

Only output `AggregateRating` structured data when AppSearchly has a genuine review collection mechanism and the displayed value is calculated from those reviews.

Third-party ratings must be labeled with their source and must not be represented as AppSearchly user ratings.

## Pricing

Pricing records should distinguish:

- free;
- freemium;
- paid subscription;
- usage based;
- one-time purchase;
- contact sales;
- open source;
- unknown.

Each verified plan stores currency, billing interval, amount, source URL, and observation time. Pricing changes create a new snapshot.

## Sponsored placement

Sponsored tools:

- are clearly labeled;
- do not receive a higher organic quality score because of payment;
- are excluded from claims such as “best” unless they independently qualify;
- retain campaign and click records separately from organic analytics.

## Retention and correction

Keep source evidence and change history long enough to investigate incorrect data. Tool owners and users must have a visible correction channel. Corrections should preserve an audit record rather than silently rewriting history.

## Sensitive information

Do not publish scraped personal emails or personal contact data unless the person intentionally supplied them for public business contact. Submission contact information belongs in private administrative storage.