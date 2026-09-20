/**
 * [INPUT]: 信号聚合指标（热度/源数/速度/SEO 缺口）
 * [OUTPUT]: 对外提供 evaluateGates → G1 搜索需求 / G2 生命周期 / G3 SERP 机会评估与决策
 * [POS]: src/lib/server/radar 的三重门决策引擎（findly v2/gates.ts 的数据驱动子集 — 无社区评论数据，G1 用热度+内容缺口代理）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { GateStatus, GateSummary, RadarDecision } from './types';
import type { VelocitySummary } from './types';

export type GateInput = {
  peakMetric: number;
  sourceCount: number;
  comingSoon: boolean;
  hasSteamSource: boolean;
  velocity: VelocitySummary | null;
  daysSinceRelease?: number;
  seoDifficulty: 'low' | 'medium' | 'high';
  wikiPresent: boolean;
  missingCount: number;
};

function evaluateSearchDemand(input: GateInput): GateStatus {
  // 代理证据：真实热度 + 薄内容层 = 玩家已在搜索但供给不足
  const hasHeat = input.peakMetric >= 1_000 || input.sourceCount >= 2;
  if (input.peakMetric >= 50_000 && input.missingCount >= 3) return 'PASS';
  if (hasHeat) return 'PARTIAL';
  return 'FAIL';
}

function evaluateLifecycle(input: GateInput): GateStatus {
  let signals = 0;
  if (input.hasSteamSource) signals += 1; // Steam 商店页已建立
  if (input.comingSoon) signals += 1;
  const velocityGrowing =
    input.velocity?.v7d != null && input.velocity.v7d > 0 ? 1 : 0;
  signals += velocityGrowing;
  if (typeof input.daysSinceRelease === 'number' && input.daysSinceRelease >= 0 && input.daysSinceRelease < 180) {
    signals += 1; // 新作生命周期上升期
  }
  if (signals >= 2) return 'PASS';
  if (signals === 1) return 'PARTIAL';
  return 'FAIL';
}

function evaluateSerp(input: GateInput): GateStatus {
  // 专有域名无法探测 — wiki 缺席视为 SERP 开放
  if (!input.wikiPresent) return 'PASS';
  if (input.missingCount >= 2) return 'PARTIAL';
  return 'FAIL';
}

export function evaluateGates(input: GateInput): { gates: GateSummary; decision: RadarDecision } {
  const gates: GateSummary = {
    g1: evaluateSearchDemand(input),
    g2: evaluateLifecycle(input),
    g3: evaluateSerp(input)
  };

  const passes = [gates.g1, gates.g2, gates.g3].filter((s) => s === 'PASS').length;
  const partials = [gates.g1, gates.g2, gates.g3].filter((s) => s === 'PARTIAL').length;

  let decision: RadarDecision;
  if (gates.g1 === 'FAIL' && gates.g2 === 'FAIL') {
    decision = 'IGNORE';
  } else if (passes === 3) {
    decision = 'BUILD_NOW';
  } else if (passes === 2) {
    decision = 'HIGH_PRIORITY';
  } else if (passes === 1 && partials >= 1) {
    decision = 'HIGH_PRIORITY';
  } else if (passes === 1 || partials >= 2) {
    decision = 'WATCH_7D';
  } else {
    decision = 'IGNORE';
  }

  // 冷启动速度数据不足 → 信心不足，最高只给 WATCH_7D（BUILD_NOW 除外）
  const velocityInsufficient =
    !input.velocity || Object.values(input.velocity).every((v) => v == null);
  if (velocityInsufficient && decision === 'BUILD_NOW') {
    decision = 'PRE_BUILD';
  }

  return { gates, decision };
}
