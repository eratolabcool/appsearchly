/**
 * [INPUT]: 依赖全局 fetch（可注入 fetchImpl 供测试 mock）
 * [OUTPUT]: 对外提供 createLarkNotifier、formatDailyReport、Notifier/DailyReport 类型
 * [POS]: src/lib/server 的通知模块，被 cron.ts 消费，负责飞书 webhook 推送
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ==================== 飞书机器人通知 ====================

export type Notifier = (message: string) => Promise<boolean>;

export type DailyReport = {
  discovered: number;
  autoApproved: Array<{ name: string; slug: string }>;
  autoRejectedDuplicates: number;
  pendingCount: number;
  failedJobs: number;
  errors: string[];
  alertThreshold?: number;
};

export function formatDailyReport(report: DailyReport): string {
  const lines = [
    '[AppSearchly] 每日采集日报',
    `今日采集: ${report.discovered}`,
    `自动发布: ${report.autoApproved.length}`,
    ...report.autoApproved.slice(0, 5).map((tool) => `  · ${tool.name} (/tools/${tool.slug})`),
    `重复自动拒绝: ${report.autoRejectedDuplicates}`,
    `待人工审核: ${report.pendingCount}${
      report.alertThreshold !== undefined && report.pendingCount > report.alertThreshold
        ? `（超过阈值 ${report.alertThreshold}，请及时处理）`
        : ''
    }`,
    `失败任务: ${report.failedJobs}`
  ];

  if (report.errors.length > 0) {
    lines.push(`错误 ${report.errors.length} 条:`);
    lines.push(...report.errors.slice(0, 3).map((error) => `  · ${error}`));
  }

  return lines.join('\n');
}

export function createLarkNotifier(options: {
  webhookUrl?: string;
  fetchImpl?: typeof fetch;
  log?: (message: string) => void;
}): Notifier {
  const fetchImpl = options.fetchImpl ?? fetch;
  const log = options.log ?? (() => undefined);

  if (!options.webhookUrl) {
    log('Lark notifier disabled: LARK_WEBHOOK_URL is not configured.');
    return async () => false;
  }

  const webhookUrl = options.webhookUrl;

  return async (message) => {
    try {
      const response = await fetchImpl(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg_type: 'text', content: { text: message } })
      });
      if (!response.ok) {
        log(`Lark webhook responded ${response.status}`);
        return false;
      }
      return true;
    } catch (error) {
      log(`Lark webhook failed: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  };
}
