# Submissions API

## POST `/api/submissions`

Request JSON fields:

- `name` (required, 2-120 characters)
- `website` (required, HTTPS URL)
- `description` (optional, up to 2,000 characters)
- `category` (optional)
- `email` (optional, valid email format)
- `turnstileToken` (required in production)

Success: HTTP 201 with `submissionId`, `qualityScore`, `recommendation`, and `status=pending_review`.

Errors:

- 400 `invalid_payload` or `invalid_url`
- 403 `captcha_failed`
- 409 `duplicate_domain`
- 422 `security_check_failed`
- 429 `rate_limited`
- 503 `database_error`
