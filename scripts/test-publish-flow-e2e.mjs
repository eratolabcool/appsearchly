/**
 * [INPUT]: 依赖 DATABASE_URL 环境变量，依赖 @lib/server/** 的数据库函数
 * [OUTPUT]: 对外提供完整的提交流程 E2E 测试，验证从提交到发布的整个工作流
 * [POS]: scripts/ 目录下的 E2E 测试脚本，验证 submission pipeline 的完整功能
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * E2E 测试：提交流程 (提交 -> 审核 -> 批准 -> 发布)
 *
 * 测试流程：
 * 1. 提交新工具申请
 * 2. 查询待审核队列
 * 3. 批准提交并创建已发布工具
 * 4. 验证工具已正确发布
 * 5. 清理测试数据
 */

import pg from 'pg';
import { processSubmission } from '../src/lib/server/submission-pipeline.js';
import { getPendingSubmissions, approveAndPublishTool, rejectSubmission } from '../src/lib/server/repositories/admin-submission-repository.js';
import { withDatabase } from '../src/lib/server/db/index.js';

const { Pool } = pg;

// ==================== 工具函数 ====================

/**
 * 生成测试用的唯一标识符
 */
function generateTestSuffix() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * 创建测试用数据库连接池
 */
function createTestPool() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }

  return new Pool({ connectionString: databaseUrl });
}

/**
 * 清理测试数据
 */
async function cleanupTestData(pool, testIds) {
  console.log('🧹 清理测试数据...');

  try {
    await pool.query('DELETE FROM tools WHERE source_submission_id = ANY($1)', [testIds]);
    await pool.query('DELETE FROM submission_quality_scores WHERE submission_id = ANY($1)', [testIds]);
    await pool.query('DELETE FROM submission_checks WHERE submission_id = ANY($1)', [testIds]);
    await pool.query('DELETE FROM submissions WHERE id = ANY($1)', [testIds]);

    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.error('⚠️ 清理测试数据时出错:', error.message);
  }
}

// ==================== 测试步骤 ====================

/**
 * 步骤 1: 提交新工具申请
 */
async function step01_submitNewTool(pool, testSuffix) {
  console.log('\n📝 步骤 1: 提交新工具申请');

  const result = await processSubmission(
    {
      name: `E2E Test Tool ${testSuffix}`,
      website: 'https://example.com',
      description: 'This is a test tool for E2E testing',
      email: `test-${testSuffix}@example.com`,
      category: 'Productivity',
      turnstileToken: 'test-token'
    },
    {
      platform: undefined,
      remoteIp: '127.0.0.1',
      fetchImpl: fetch
    }
  );

  if (!result.success) {
    throw new Error(`提交失败: ${result.error}`);
  }

  console.log(`✅ 提交成功 - ID: ${result.submissionId}, 状态: ${result.status}`);
  console.log(`   质量分数: ${result.qualityScore}, 建议: ${result.recommendation}`);

  return result.submissionId;
}

/**
 * 步骤 2: 查询待审核队列
 */
async function step02_queryReviewQueue(pool, submissionId) {
  console.log('\n🔍 步骤 2: 查询待审核队列');

  const pending = await getPendingSubmissions(pool);

  console.log(`✅ 待审核队列中有 ${pending.length} 个提交`);

  const found = pending.find(s => s.id === submissionId);
  if (!found) {
    throw new Error(`提交 ${submissionId} 不在待审核队列中`);
  }

  console.log(`✅ 找到测试提交 - 名称: ${found.submitted_name}, URL: ${found.submitted_url}`);
  return found;
}

/**
 * 步骤 3: 批准提交并创建已发布工具
 */
async function step03_approveAndPublish(pool, submissionId) {
  console.log('\n✅ 步骤 3: 批准提交并创建已发布工具');

  const { submission, tool } = await approveAndPublishTool(pool, submissionId);

  console.log(`✅ 批准成功 - 提交状态: ${submission.status}`);
  console.log(`✅ 工具已创建 - ID: ${tool.id}, Slug: ${tool.slug}, 状态: ${tool.status}`);

  return { submission, tool };
}

/**
 * 步骤 4: 验证工具已正确发布
 */
async function step04_verifyPublishedTool(pool, toolId, submissionId) {
  console.log('\n🔍 步骤 4: 验证工具已正确发布');

  const result = await pool.query(
    'SELECT * FROM tools WHERE id = $1 AND status = $2',
    [toolId, 'published']
  );

  if (result.rows.length === 0) {
    throw new Error(`工具 ${toolId} 未找到或状态不正确`);
  }

  const tool = result.rows[0];

  if (tool.source_submission_id !== submissionId) {
    throw new Error(`工具的 source_submission_id 不正确`);
  }

  console.log(`✅ 工具验证成功:`);
  console.log(`   - 名称: ${tool.name}`);
  console.log(`   - Slug: ${tool.slug}`);
  console.log(`   - 网站: ${tool.website}`);
  console.log(`   - 描述: ${tool.description}`);
  console.log(`   - 分类: ${tool.category}`);
  console.log(`   - 状态: ${tool.status}`);
  console.log(`   - 来源提交 ID: ${tool.source_submission_id}`);
}

/**
 * 步骤 5: 测试拒绝流程 (额外测试)
 */
async function step05_testRejectFlow(pool, testSuffix) {
  console.log('\n❌ 步骤 5: 测试拒绝流程');

  // 提交另一个工具用于拒绝测试
  const result = await processSubmission(
    {
      name: `E2E Reject Test Tool ${testSuffix}`,
      website: 'https://reject-example.com',
      description: 'This tool will be rejected',
      email: `reject-test-${testSuffix}@example.com`,
      category: 'Test',
      turnstileToken: 'test-token'
    },
    {
      platform: undefined,
      remoteIp: '127.0.0.1',
      fetchImpl: fetch
    }
  );

  if (!result.success) {
    throw new Error(`拒绝测试提交失败: ${result.error}`);
  }

  const rejectSubmissionId = result.submissionId;

  // 拒绝提交
  await rejectSubmission(pool, rejectSubmissionId, 'E2E 测试 - 拒绝测试');

  // 验证提交状态
  const checkResult = await pool.query(
    'SELECT status, review_action, rejection_reason FROM submissions WHERE id = $1',
    [rejectSubmissionId]
  );

  if (checkResult.rows.length === 0) {
    throw new Error(`拒绝测试提交未找到: ${rejectSubmissionId}`);
  }

  const rejected = checkResult.rows[0];

  if (rejected.status !== 'rejected' || rejected.review_action !== 'rejected') {
    throw new Error(`提交状态不正确: ${rejected.status}, ${rejected.review_action}`);
  }

  console.log(`✅ 拒绝流程测试成功 - 提交 ID: ${rejectSubmissionId}`);
  console.log(`   拒绝原因: ${rejected.rejection_reason}`);

  return rejectSubmissionId;
}

// ==================== 主测试流程 ====================

/**
 * 运行完整的 E2E 测试
 */
async function runE2ETest() {
  const pool = createTestPool();
  const testSuffix = generateTestSuffix();
  const submissionIds = [];

  try {
    console.log('🚀 开始 E2E 测试 - 发布流程');
    console.log(`📌 测试后缀: ${testSuffix}\n`);

    // 步骤 1: 提交新工具
    const submissionId = await step01_submitNewTool(pool, testSuffix);
    submissionIds.push(submissionId);

    // 步骤 2: 查询待审核队列
    await step02_queryReviewQueue(pool, submissionId);

    // 步骤 3: 批准并发布
    const { tool } = await step03_approveAndPublish(pool, submissionId);

    // 步骤 4: 验证发布结果
    await step04_verifyPublishedTool(pool, tool.id, submissionId);

    // 步骤 5: 测试拒绝流程
    const rejectId = await step05_testRejectFlow(pool, testSuffix);
    submissionIds.push(rejectId);

    console.log('\n✨ 所有 E2E 测试通过！');
  } catch (error) {
    console.error('\n❌ E2E 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // 清理测试数据
    await cleanupTestData(pool, submissionIds);
    await pool.end();
  }
}

// ==================== 执行测试 ====================

if (import.meta.url === `file://${process.argv[1]}`) {
  runE2ETest().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runE2ETest };
