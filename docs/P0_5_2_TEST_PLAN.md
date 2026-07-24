# P0.5.2 Verification Plan

## Automated

- Run `npm run test:submission-quality`.
- Run `npm run check`.
- Run `npm run build`.
- Apply migrations twice against PostgreSQL 16.
- Confirm all 12 expected tables and two tracked migrations.
- Run Wrangler production dry-run with both required Worker secrets.

## Production smoke

After deploying with migrations enabled:

1. Open `/submit` and confirm Turnstile renders.
2. Submit a valid HTTPS AI tool and expect HTTP 201.
3. Confirm one row exists in `submissions`, related rows exist in `submission_checks`, and one row exists in `submission_quality_scores`.
4. Submit the same domain again and expect HTTP 409.
5. Submit an HTTP URL and expect HTTP 422.
6. Confirm no submission is automatically published into `tools`.
