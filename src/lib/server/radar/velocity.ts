/**
 * [INPUT]: SnapshotPoint 快照历史（来自 radar_snapshots 表）
 * [OUTPUT]: 对外提供 computeVelocity → 多窗口速度（24h/72h/7d/14d/30d），null 表示数据不足
 * [POS]: src/lib/server/radar 的速度分析引擎 — findly 的 velocity 因从不落快照而恒 null，此处基于真快照工作
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { VelocitySummary } from './types';

export type VelocityInput = {
  capturedAt: number; // epoch ms
  metric: number | null;
  rank: number | null;
};

/**
 * 计算指标在时间窗口内的变化量。数据不足返回 null，严格 null ≠ 0。
 * rank 反向：从 #100 升到 #20 是 +80。
 */
export function calculateDelta(
  snapshots: VelocityInput[],
  windowMs: number,
  nowMs: number
): number | null {
  if (!snapshots || snapshots.length < 2) return null;

  const sorted = [...snapshots].sort((a, b) => a.capturedAt - b.capturedAt);
  const latest = sorted[sorted.length - 1];
  const latestVal = latest.metric;
  if (latestVal === null) return null;

  const targetTime = nowMs - windowMs;
  let baseline: VelocityInput | null = null;
  let minDiff = Infinity;
  for (const pt of sorted) {
    if (pt.metric === null) continue;
    const diff = Math.abs(pt.capturedAt - targetTime);
    if (diff < minDiff && pt.capturedAt < latest.capturedAt) {
      minDiff = diff;
      baseline = pt;
    }
  }
  if (!baseline || baseline.metric === null) return null;

  return latestVal - baseline.metric;
}

/** rank 窗口变化量（升榜为正） */
export function calculateRankDelta(
  snapshots: VelocityInput[],
  windowMs: number,
  nowMs: number
): number | null {
  if (!snapshots || snapshots.length < 2) return null;
  const sorted = [...snapshots].sort((a, b) => a.capturedAt - b.capturedAt);
  const latest = sorted[sorted.length - 1];
  if (latest.rank == null) return null;

  const targetTime = nowMs - windowMs;
  let baseline: VelocityInput | null = null;
  let minDiff = Infinity;
  for (const pt of sorted) {
    if (pt.rank == null) continue;
    const diff = Math.abs(pt.capturedAt - targetTime);
    if (diff < minDiff && pt.capturedAt < latest.capturedAt) {
      minDiff = diff;
      baseline = pt;
    }
  }
  if (!baseline || baseline.rank == null) return null;

  return baseline.rank - latest.rank;
}

export function computeVelocity(snapshots: VelocityInput[], nowMs: number): VelocitySummary {
  const HOUR = 60 * 60 * 1000;
  return {
    v24h: calculateDelta(snapshots, 24 * HOUR, nowMs),
    v72h: calculateDelta(snapshots, 72 * HOUR, nowMs),
    v7d: calculateDelta(snapshots, 7 * 24 * HOUR, nowMs),
    v14d: calculateDelta(snapshots, 14 * 24 * HOUR, nowMs),
    v30d: calculateDelta(snapshots, 30 * 24 * HOUR, nowMs)
  };
}
