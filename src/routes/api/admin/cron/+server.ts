/**
 * [INPUT]: 依赖 $lib/server/admin-auth 的 isAdminAuthorized，依赖 $lib/server/cron 的 runDailyCron/runWeeklyArticleCron，依赖 $lib/server/radar/pipeline 的 runRadarCron
 * [OUTPUT]: POST /api/admin/cron — 手动触发定时任务（job=daily|weekly|radar），返回执行报告
 * [POS]: api/admin 的运维端点，与 discovery/jobs 同级；飞书日报断供时的诊断与补跑入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { runDailyCron, runWeeklyArticleCron } from '$lib/server/cron';
import { runRadarCron } from '$lib/server/radar/pipeline';

export const prerender = false;

export const POST: RequestHandler = async ({ platform, request }) => {
  if (!isAdminAuthorized(request, platform)) return json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const job = ['weekly', 'radar'].includes(body?.job) ? body.job : 'daily';

  try {
    if (job === 'weekly') {
      const result = await runWeeklyArticleCron(platform!.env);
      return json({ job, result });
    }
    if (job === 'radar') {
      const digest = await runRadarCron(platform!.env);
      return json({ job, digest });
    }
    const report = await runDailyCron(platform!.env);
    return json({ job, report });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error('Manual cron run failed:', error);
    return json({ job, error: reason }, { status: 500 });
  }
};
