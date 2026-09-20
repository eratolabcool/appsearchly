/**
 * [INPUT]: RadarDigest
 * [OUTPUT]: 对外提供 formatRadarLarkReport → 飞书文本日报（<4KB）
 * [POS]: src/lib/server/radar 的报告渲染层，替代 findly 的 Telegram digest（digest.ts/reports.ts 合并）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { RadarDigest, RadarOpportunity } from './types';

const DECISION_LABELS: Record<string, string> = {
  BUILD_NOW: '立即行动',
  PRE_BUILD: '预构建',
  HIGH_PRIORITY: '高优先级',
  WATCH_7D: '观察7天',
  IGNORE: '忽略'
};

function formatOpportunityLine(opp: RadarOpportunity, index: number): string {
  const decision = DECISION_LABELS[opp.decision] ?? opp.decision;
  const velocity =
    opp.velocity?.v7d != null ? `，7d速度 ${opp.velocity.v7d > 0 ? '+' : ''}${opp.velocity.v7d}` : '';
  const gaps = opp.missingAssets.slice(0, 3).join('/');
  return `${index + 1}. [${decision}] ${opp.title} — 分数 ${opp.score}${velocity}\n   缺口: ${gaps || '无'} | ${opp.sources.join(' + ')}`;
}

/** 纯文本飞书日报：top5 机会 + 源健康一行 + 事件亮点 */
export function formatRadarLarkReport(digest: RadarDigest): string {
  const date = digest.generatedAt.slice(0, 10);
  const lines: string[] = [
    `[AppSearchly] 游戏机会雷达日报 (${date})`,
    `状态: ${digest.status === 'success' ? '正常' : digest.status === 'partial' ? '部分源异常' : '失败'}`
  ];

  if (digest.opportunities.length === 0) {
    lines.push('今日未发现可用机会（源可能全部异常）。');
  } else {
    lines.push('');
    lines.push('== Top 机会 ==');
    for (const [index, opp] of digest.opportunities.slice(0, 5).entries()) {
      lines.push(formatOpportunityLine(opp, index));
    }

    const eventful = digest.opportunities.filter((o) => o.events.length > 0).slice(0, 3);
    if (eventful.length > 0) {
      lines.push('');
      lines.push('== 事件 ==');
      for (const opp of eventful) {
        lines.push(`${opp.title}: ${opp.events.join(', ')}`);
      }
    }
  }

  lines.push('');
  const healthLine = digest.sources
    .map((s) => `${s.id}:${s.ok ? s.count : 'err'}`)
    .join(' | ');
  lines.push(`源健康: ${healthLine}`);
  lines.push('详情: https://www.appsearchly.com/radar');

  return lines.join('\n');
}
