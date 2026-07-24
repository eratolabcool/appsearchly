# P0.5.2 Release Checklist

- [ ] CI passes migrations, contract tests, Svelte checks, build, and Wrangler dry-run.
- [ ] Create a Cloudflare Turnstile widget for `appsearchly.com`.
- [ ] Add `TURNSTILE_SECRET_KEY` as a GitHub `production` Environment secret.
- [ ] Add `PUBLIC_TURNSTILE_SITE_KEY` as a GitHub `production` Environment variable.
- [ ] Deploy with `run_migrations=true` once after merge.
- [ ] Verify `/submit` renders Turnstile.
- [ ] Submit one valid tool and verify the submission, checks, and score transaction.
- [ ] Verify duplicate, insecure URL, invalid captcha, and rate-limit responses.
- [ ] Confirm no submission is automatically published.
