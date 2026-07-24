import type { Pool } from 'pg';

export async function getPendingSubmissions(pool: Pool) {
  const result = await pool.query(`
    SELECT
      s.id,
      s.submitted_name,
      s.submitted_url,
      s.normalized_domain,
      s.status,
      s.created_at,
      q.overall_score,
      q.recommendation
    FROM submissions s
    LEFT JOIN submission_quality_scores q
      ON q.submission_id = s.id
    WHERE s.status IN ('pending', 'needs_review')
    ORDER BY COALESCE(q.overall_score, 0) DESC, s.created_at ASC
  `);

  return result.rows;
}

export async function getSubmissionDetail(pool: Pool, id: string) {
  const submission = await pool.query(
    `SELECT * FROM submissions WHERE id = $1`,
    [id]
  );

  const checks = await pool.query(
    `SELECT * FROM submission_checks WHERE submission_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  const score = await pool.query(
    `SELECT * FROM submission_quality_scores WHERE submission_id = $1`,
    [id]
  );

  return {
    submission: submission.rows[0] ?? null,
    checks: checks.rows,
    quality: score.rows[0] ?? null
  };
}

export async function rejectSubmission(pool: Pool, id: string, reason: string) {
  await pool.query(
    `UPDATE submissions
     SET status = 'rejected', review_action = 'rejected', rejection_reason = $2, reviewed_at = now()
     WHERE id = $1`,
    [id, reason]
  );
}

export async function approveSubmission(pool: Pool, id: string) {
  const result = await pool.query(
    `UPDATE submissions
     SET status = 'approved', review_action = 'approved', reviewed_at = now()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0] ?? null;
}
