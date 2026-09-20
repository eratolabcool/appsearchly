/**
 * [INPUT]: 决策结果 + 事件 + SEO 缺口 + 源标签
 * [OUTPUT]: 对外提供 buildRecommendations → 行动/栏目/工具建议
 * [POS]: src/lib/server/radar 的推荐规则表（findly v2/recommendations.ts 规则表的紧凑移植）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { AssetGap, RadarDecision, RadarEventType, RadarRecommendations } from './types';

export function buildRecommendations(input: {
  decision: RadarDecision;
  events: RadarEventType[];
  missingAssets: AssetGap[];
  tags: string[];
}): RadarRecommendations {
  const actions: string[] = [];
  const sections: string[] = [];
  const tools: string[] = [];
  const tags = new Set(input.tags.map((t) => t.toLowerCase()));

  switch (input.decision) {
    case 'BUILD_NOW':
      actions.push('Launch a dedicated companion site now — SERP window is open.');
      break;
    case 'PRE_BUILD':
      actions.push('Prepare content and domain now; confirm demand before full build.');
      break;
    case 'HIGH_PRIORITY':
      actions.push('Build the highest-gap asset first (wiki or database).');
      break;
    case 'WATCH_7D':
      actions.push('Re-check in the next daily report before committing.');
      break;
    default:
      actions.push('No action — keep on the radar only.');
  }

  if (input.events.includes('VELOCITY_BREAKOUT')) {
    actions.push('Velocity breakout: publish speedily — attention spikes decay fast.');
  }

  if (input.missingAssets.includes('database')) {
    sections.push('item-database');
    tools.push('database');
  }
  if (input.missingAssets.includes('calculator')) {
    sections.push('calculators');
    tools.push('calculator');
  }
  if (input.missingAssets.includes('tier-list')) {
    sections.push('tier-lists');
    tools.push('tier-maker');
  }
  if (input.missingAssets.includes('wiki') && input.decision !== 'IGNORE') {
    sections.push('wiki');
  }
  if (input.missingAssets.includes('guides')) {
    sections.push('guides');
  }

  if (tags.has('incremental') || tags.has('idle')) tools.push('idle-calculator');
  if (tags.has('roguelike') || tags.has('roguelite')) tools.push('build-planner');
  if (tags.has('daily')) tools.push('daily-answers');

  return {
    actions: Array.from(new Set(actions)),
    sections: Array.from(new Set(sections)),
    tools: Array.from(new Set(tools))
  };
}
