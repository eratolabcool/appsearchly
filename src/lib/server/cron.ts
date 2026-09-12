/**
 * [INPUT]: 依赖 ./db 的 withDatabase，依赖 ./acquisition/pipeline 的 runDiscovery/autoApproveImports/pipelineMetrics，依赖 ./notify 的 createLarkNotifier/formatDailyReport，依赖 ./article-generator 的 generateWeeklyArticleDraft
 * [OUTPUT]: 对外提供 runDailyCron、runWeeklyArticleCron
 * [POS]: src/lib/server 的 cron 编排层，由 scripts/write-worker-entry.mjs 生成的 scheduled handler 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { isDatabaseConfigured, withDatabase } from './db';
import { autoApproveImports, pipelineMetrics, runDiscovery } from './acquisition/pipeline';
import { createLarkNotifier, formatDailyReport, type DailyReport, type Notifier } from './notify';
import { generateWeeklyArticleDraft } from './article-generator';

export type CronDeps = {
  fetchImpl?: typeof fetch;
  notifier?: Notifier;
};

function toPlatform(env: App.Platform['env']): App.Platform {
  return { env } as App.Platform;
}

// ==================== 每日采集 + 自动批准 + 日报 ====================

export async function runDailyCron(
  env: App.Platform['env'],
  deps: CronDeps = {}
): Promise<DailyReport> {
  const emptyReport: DailyReport = {
    discovered: 0,
    autoApproved: [],
    autoRejectedDuplicates: 0,
    pendingCount: 0,
    failedJobs: 0,
    errors: []
  };

  if (!isDatabaseConfigured(toPlatform(env))) {
    console.warn('AppSearchly daily cron skipped: database is not configured.');
    return emptyReport;
  }

  const notifier = deps.notifier ?? createLarkNotifier({ webhookUrl: env?.LARK_WEBHOOK_URL });

  const report = await withDatabase(toPlatform(env), async (client) => {
    const discovery = await runDiscovery(client, {
      sourceLimit: 6,
      itemLimit: 100,
      fetchImpl: deps.fetchImpl,
      extractorEndpoint: env?.AI_EXTRACTOR_ENDPOINT,
      extractorApiKey: env?.AI_EXTRACTOR_API_KEY
    });

    const minScore = Number(env?.AUTO_APPROVE_MIN_SCORE ?? 85);
    const maxPerDay = Number(env?.AUTO_APPROVE_MAX_PER_DAY ?? 50);
    const auto =
      Number.isFinite(minScore) && minScore > 0
        ? await autoApproveImports(client, { minScore, limit: maxPerDay })
        : { evaluated: 0, approved: [], rejectedDuplicates: 0, errors: [] };

    const metrics = await pipelineMetrics(client);

    return {
      discovered: discovery.itemsFound,
      autoApproved: auto.approved.map(({ name, slug }) => ({ name, slug })),
      autoRejectedDuplicates: auto.rejectedDuplicates,
      pendingCount: Number(metrics.pending ?? 0),
      failedJobs: Number(metrics.failed_jobs ?? 0),
      errors: [...discovery.errors, ...auto.errors],
      alertThreshold: env?.PENDING_ALERT_THRESHOLD ? Number(env.PENDING_ALERT_THRESHOLD) : undefined
    } satisfies DailyReport;
  });

  await notifier(formatDailyReport(report));
  console.log('AppSearchly daily cron completed:', JSON.stringify(report));
  return report;
}

// ==================== 每周 AI 榜单文章 ====================

export type WeeklyArticleResult = {
  created: boolean;
  slug?: string;
  title?: string;
  reason?: string;
};

export async function runWeeklyArticleCron(
  env: App.Platform['env'],
  deps: CronDeps = {}
): Promise<WeeklyArticleResult> {
  const platform = toPlatform(env);

  if (!env?.AI) {
    console.warn('AppSearchly weekly article cron skipped: AI binding is not configured.');
    return { created: false, reason: 'ai_binding_not_configured' };
  }

  if (!isDatabaseConfigured(platform)) {
    console.warn('AppSearchly weekly article cron skipped: database is not configured.');
    return { created: false, reason: 'database_not_configured' };
  }

  const notifier = deps.notifier ?? createLarkNotifier({ webhookUrl: env.LARK_WEBHOOK_URL });
  const aiRun = async (model: string, input: unknown) => {
    const response: unknown = await env.AI!.run(model, input);
    return response as { response?: string };
  };

  try {
    const result = await withDatabase(platform, (client) =>
      generateWeeklyArticleDraft(client, {
        aiRun,
        model: env.ARTICLE_MODEL,
        topN: env.ARTICLE_TOP_N ? Number(env.ARTICLE_TOP_N) : undefined
      })
    );

    if ('skipped' in result) {
      await notifier(`[AppSearchly] 本周文章生成跳过：${result.skipped}`);
      return { created: false, reason: result.skipped };
    }

    await notifier(
      `[AppSearchly] 本周文章草稿已生成：《${result.title}》 (/blog/${result.slug})，请到 /admin/articles 审核发布`
    );
    console.log('AppSearchly weekly article cron completed:', JSON.stringify(result));
    return { created: true, slug: result.slug, title: result.title };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error('AppSearchly weekly article cron failed:', error);
    await notifier(`[AppSearchly] 本周文章生成失败：${reason}`);
    return { created: false, reason };
  }
}
