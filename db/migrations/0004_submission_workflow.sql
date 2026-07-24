BEGIN;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS review_action text
    CHECK (review_action IS NULL OR review_action IN ('approved','rejected'));

CREATE INDEX IF NOT EXISTS submissions_review_queue_idx
  ON submissions(status, created_at DESC);

COMMIT;
