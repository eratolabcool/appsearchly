import type { Pool } from 'pg';
import { createPublishedTool, type PublishedToolInput } from './tool-repository';

// ==================== 查询函数 ====================

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

// ==================== 审核操作 ====================

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
export async function approveAndPublishTool(pool: Pool, id: string) {
  // 开始事务
  await pool.query('BEGIN');

  try {
    // 1. 批准提交
    const submission = await approveSubmission(pool, id);

    if (!submission) {
      await pool.query('ROLLBACK');
      throw new Error('Submission not found');
    }

    // 2. 创建已发布工具
    const tool = await createPublishedTool(pool, {
      name: submission.submitted_name || submission.name,
      website: submission.submitted_url || submission.website,
      description: submission.description,
      category: submission.category,
      sourceSubmissionId: submission.id,
    });

    // 提交事务
    await pool.query('COMMIT');

    return { submission, tool };
  } catch (error) {
    // 回滚事务
    await pool.query('ROLLBACK').catch(() => undefined);
    throw error;
  }
}
