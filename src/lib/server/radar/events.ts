/**
 * [INPUT]: 实体首见时间 / 源列表 / 速度 / SEO 缺口
 * [OUTPUT]: 对外提供 classifyRadarEvents → 可计算事件列表（NEW_GAME/VELOCITY_BREAKOUT/CROSS_PLATFORM/缺口事件）
 * [POS]: src/lib/server/radar 的事件分类层（findly v2/events.ts 的可计算子集，20 种事件裁剪到 7 种）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { AssetGap, RadarEventType, VelocitySummary } from './types';

export function classifyRadarEvents(input: {
  slug: string;
  firstSeenAt?: string;
  sources: string[];
  velocity: VelocitySummary | null;
  missingAssets: AssetGap[];
  now: Date;
}): RadarEventType[] {
  const events: RadarEventType[] = [];

  if (input.firstSeenAt) {
    const seen = new Date(input.firstSeenAt).getTime();
    if (input.now.getTime() - seen < 48 * 60 * 60 * 1000) {
      events.push('NEW_GAME');
    }
  }

  const v24h = input.velocity?.v24h;
  if (typeof v24h === 'number' && v24h >= 200) {
    events.push('VELOCITY_BREAKOUT');
  }

  if (input.sources.length >= 2) {
    events.push('CROSS_PLATFORM');
  }

  if (input.missingAssets.includes('wiki')) events.push('WIKI_GAP');
  if (input.missingAssets.includes('guides')) events.push('GUIDE_GAP');
  if (input.missingAssets.includes('calculator')) events.push('TOOL_GAP');
  if (input.missingAssets.includes('database')) events.push('DATABASE_GAP');

  return events;
}
