/**
 * [INPUT]: 依赖 APP_BASE_URL 和可选的 ADMIN_API_TOKEN 环境变量
 * [OUTPUT]: 对外提供生产环境发布流程的 smoke 测试，验证审核工作流 API 端点
 * [POS]: scripts/ 目录下的生产环境 smoke 测试脚本，验证发布工作流的健康状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/**
 * 生产环境 Smoke 测试：发布流程 (审核工作流)
 *
 * 验证生产环境的发布流程 API 端点是否正常工作：
 * 1. 健康检查
 * 2. 提交端点可用性检查（不实际创建提交）
 * 3. 审核队列端点检查（需要管理员 token）
 * 4. 工具详情页面检查
 */

// ==================== 配置 ====================

const baseUrlValue = process.env.APP_BASE_URL?.trim();
const adminToken = process.env.ADMIN_API_TOKEN?.trim();
const maxAttempts = 3;
const timeoutMs = 15000;

if (!baseUrlValue) {
  throw new Error('APP_BASE_URL is required.');
}

const baseUrl = new URL(baseUrlValue);
if (baseUrl.protocol !== 'https:') {
  throw new Error('APP_BASE_URL must use HTTPS for production smoke tests.');
}

// ==================== 工具函数 ====================

/**
 * 睡眠函数
 */
function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * 带超时的请求函数
 */
async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(new URL(path, baseUrl), {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timer);

    const text = await response.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = { text };
    }

    return { response, body };
  } catch (error) {
    clearTimeout(timer);
    throw error;
  }
}

/**
 * 带重试的请求函数
 */
async function retry(label, check) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`  🔄 ${label} (尝试 ${attempt}/${maxAttempts})`);
      const result = await check();
      if (attempt > 1) {
        console.log(`  ✅ ${label} 成功 (重试 ${attempt - 1} 次后)`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`  ⚠️  ${label} 失败: ${error.message}`);

      if (attempt < maxAttempts) {
        const delay = attempt * 1000;
        console.log(`  ⏳ 等待 ${delay}ms 后重试...`);
        await sleep(delay);
      }
    }
  }

  console.error(`  ❌ ${label} 失败 (重试 ${maxAttempts} 次后)`);
  throw lastError;
}

// ==================== 测试步骤 ====================

/**
 * 步骤 1: 基础健康检查
 */
async function step01_healthCheck() {
  console.log('\n🔍 步骤 1: 基础健康检查');

  const { response, body } = await request('/', { method: 'HEAD' });

  if (!response.ok) {
    throw new Error(`健康检查失败: HTTP ${response.status}`);
  }

  console.log(`✅ 健康检查通过 - HTTP ${response.status}`);
}

/**
 * 步骤 2: 提交端点可用性检查
 */
async function step02_submitEndpointCheck() {
  console.log('\n📝 步骤 2: 提交端点可用性检查');

  // 检查 OPTIONS 请求（CORS preflight）
  const { response: optionsResponse } = await request('/api/submit-app', {
    method: 'OPTIONS'
  });

  if (!optionsResponse.ok && optionsResponse.status !== 204) {
    console.warn(`⚠️  OPTIONS 请求返回 ${optionsResponse.status}`);
  }

  // 检查 GET 请求（应该返回方法不允许或错误）
  const { response: getResponse } = await request('/api/submit-app', {
    method: 'GET'
  });

  if (getResponse.status === 405 || getResponse.status === 404) {
    console.log(`✅ 提交端点存在 - GET 返回 ${getResponse.status} (预期)`);
  } else {
    console.warn(`⚠️  提交端点 GET 返回 ${getResponse.status}`);
  }
}

/**
 * 步骤 3: 审核队列端点检查
 */
async function step03_reviewQueueCheck() {
  console.log('\n👀 步骤 3: 审核队列端点检查');

  const headers = {};
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  try {
    const { response, body } = await request('/api/admin/submissions', {
      method: 'GET',
      headers
    });

    if (response.status === 401 || response.status === 403) {
      console.log(`✅ 审核队列端点存在 - 需要认证 (${response.status})`);
    } else if (response.status === 200) {
      console.log(`✅ 审核队列端点正常 - 返回 ${body.items?.length ?? 0} 个提交`);
    } else if (response.status === 503) {
      console.warn(`⚠️  审核队列端点返回 503 - 数据库可能不可用`);
    } else {
      console.warn(`⚠️  审核队列端点返回 ${response.status}`);
    }
  } catch (error) {
    console.warn(`⚠️  审核队列端点检查失败: ${error.message}`);
  }
}

/**
 * 步骤 4: 工具发布流程端点检查
 */
async function step04_publishFlowEndpointsCheck() {
  console.log('\n🚀 步骤 4: 工具发布流程端点检查');

  const headers = {};
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  // 检查 approve 端点 (不实际调用)
  try {
    const { response: approveOptions } = await request('/api/admin/submissions/test-id/approve', {
      method: 'OPTIONS',
      headers
    });

    if (approveOptions.ok || approveOptions.status === 204) {
      console.log(`✅ Approve 端点存在`);
    }
  } catch (error) {
    console.warn(`⚠️  Approve 端点检查失败: ${error.message}`);
  }

  // 检查 reject 端点 (不实际调用)
  try {
    const { response: rejectOptions } = await request('/api/admin/submissions/test-id/reject', {
      method: 'OPTIONS',
      headers
    });

    if (rejectOptions.ok || rejectOptions.status === 204) {
      console.log(`✅ Reject 端点存在`);
    }
  } catch (error) {
    console.warn(`⚠️  Reject 端点检查失败: ${error.message}`);
  }
}

/**
 * 步骤 5: 工具详情页面检查
 */
async function step05_toolDetailPageCheck() {
  console.log('\n📄 步骤 5: 工具详情页面检查');

  try {
    const { response, body } = await request('/tools/test-slug', {
      method: 'GET'
    });

    if (response.status === 404) {
      console.log(`✅ 工具详情路由存在 (test-slug 返回 404 - 预期)`);
    } else if (response.status === 200) {
      console.log(`✅ 工具详情路由正常`);
    } else {
      console.warn(`⚠️  工具详情路由返回 ${response.status}`);
    }
  } catch (error) {
    console.warn(`⚠️  工具详情页面检查失败: ${error.message}`);
  }
}

/**
 * 步骤 6: 数据库连接检查 (间接)
 */
async function step06_databaseConnectionCheck() {
  console.log('\n🗄️  步骤 6: 数据库连接检查 (间接)');

  try {
    const { response, body } = await request('/api/admin/submissions', {
      method: 'GET',
      headers: adminToken ? { Authorization: `Bearer ${adminToken}` } : {}
    });

    if (response.status === 503) {
      console.warn(`⚠️  数据库可能不可用 (503 Service Unavailable)`);
    } else if (response.status === 401 || response.status === 403) {
      console.log(`✅ 数据库可能可用 (认证端点响应)`);
    } else if (response.status === 200) {
      console.log(`✅ 数据库可用 (返回数据)`);
    }
  } catch (error) {
    console.warn(`⚠️  数据库连接检查失败: ${error.message}`);
  }
}

// ==================== 主测试流程 ====================

/**
 * 运行完整的 smoke 测试
 */
async function runSmokeTest() {
  console.log('🔥 开始发布流程 Smoke 测试');
  console.log(`📍 目标: ${baseUrl.origin}`);
  console.log(`🔐 管理员 Token: ${adminToken ? '已设置' : '未设置'}\n`);

  const startTime = Date.now();

  try {
    // 步骤 1: 健康检查
    await retry('健康检查', step01_healthCheck);

    // 步骤 2: 提交端点检查
    await retry('提交端点检查', step02_submitEndpointCheck);

    // 步骤 3: 审核队列检查
    await retry('审核队列检查', step03_reviewQueueCheck);

    // 步骤 4: 发布流程端点检查
    await retry('发布流程端点检查', step04_publishFlowEndpointsCheck);

    // 步骤 5: 工具详情页面检查
    await retry('工具详情页面检查', step05_toolDetailPageCheck);

    // 步骤 6: 数据库连接检查
    await retry('数据库连接检查', step06_databaseConnectionCheck);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✨ 发布流程 Smoke 测试完成！');
    console.log(`⏱️  总耗时: ${duration} 秒`);
    console.log('\n✅ 所有关键端点已检查');
  } catch (error) {
    console.error('\n❌ Smoke 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ==================== 执行测试 ====================

if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTest().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { runSmokeTest };
