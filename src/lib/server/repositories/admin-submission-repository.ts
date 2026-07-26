import type { Pool, QueryResult, QueryResultRow } from 'pg';
import { createPublishedTool } from './tool-repository';

type Queryable = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
};

// ==================== 查询函数 ====================

export async function getPendingSubmissions(db: Queryable) {
  const result = await db.query(`
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

export async function getSubmissionDetail(db: Queryable, id: string) {
  const submission = await db.query(
    `SELECT * FROM submissions WHERE id = $1`,
    [id]
  );

  const checks = await db.query(
    `SELECT * FROM submission_checks WHERE submission_id = $1 ORDER BY created_at DESC`,
    [id]
  );

  const score = await db.query(
    `SELECT * FROM submission_quality_scores WHERE submission_id = $1`,
    [id]
  );

  return {
    submission: submission.rows[0] ?? null,
    checks: checks.rows,
    quality: score.rows[0] ?? null
  };
}

// ==================== 审核操作 ====================

export async function rejectSubmission(db: Queryable, id: string, reason: string) {
  await db.query(
    `UPDATE submissions
     SET status = 'rejected', review_action = 'rejected', rejection_reason = $2, reviewed_at = now()
     WHERE id = $1`,
    [id, reason]
  );
}

export async function approveSubmission(db: Queryable, id: string) {
  const result = await db.query(
    `UPDATE submissions
     SET status = 'approved', review_action = 'approved', reviewed_at = now()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0] ?? null;
}

// ==================== 事务操作 ====================

/**
 * 批准提交并创建已发布工具（原子操作）
 * 将 approve 和 createPublishedTool 包装在数据库事务中，确保数据一致性
 *
 * @param pool - 数据库连接池
 * @param id - 提交 ID
 * @returns { submission, tool } 批准的提交和创建的工具
 * @throws 如果操作失败，事务会回滚
 */
export async function approveAndPublishToolInTransaction(client: Queryable, id: string) {
  try {
    await client.query('BEGIN');
    const submission = await approveSubmission(client, id);

    if (!submission) {
      throw new Error('Submission not found');
    }

    const rawPayload = typeof submission.raw_payload === 'object' && submission.raw_payload !== null
      ? submission.raw_payload as Record<string, unknown>
      : {};
    const tool = await createPublishedTool(client, {
      name: submission.submitted_name,
      website: submission.submitted_url,
      description: typeof rawPayload.description === 'string' ? rawPayload.description : undefined,
      category: typeof rawPayload.category === 'string' ? rawPayload.category : null,
      sourceSubmissionId: submission.id,
    });

    await client.query('COMMIT');

    return { submission, tool };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  }
}

export async function approveAndPublishTool(pool: Pool, id: string) {
  const client = await pool.connect();

  try {
    return await approveAndPublishToolInTransaction(client, id);
  } finally {
    client.release();
  }
}
