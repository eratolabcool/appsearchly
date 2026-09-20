/**
 * [INPUT]: 多源 RadarSignal + SEO gap 分析 + 各实体 DB 快照历史
 * [OUTPUT]: 对外提供 scoreGameOpportunities → 排序后的 RadarOpportunity（含 gates/decision/events/recommendations）
 * [POS]: src/lib/server/radar 评分引擎 — 机会分 = 热度 + 增长 + 缺口 − 饱和 + 新鲜度 + 速度加成
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { daysSince, formatAgeLabel, normalizeEntityKey } from './normalize';
import { analyzeSeoGap } from './sources/seo-gap';
import { classifyRadarEvents } from './events';
import { evaluateGates } from './gates';
import { buildRecommendations } from './recommendations';
import { computeVelocity, type VelocityInput } from './velocity';
import type { MonetizationChannel, RadarDigest, RadarOpportunity, RadarSignal, RadarSnapshotRow } from './types';

export const OPPORTUNITY_LIMIT = 15;
export const SEO_PROBE_LIMIT = 10;

function monetizationFor(missing: RadarOpportunity['missingAssets']): MonetizationChannel[] {
  const channels: MonetizationChannel[] = ['ads'];
  if (missing.includes('calculator') || missing.includes('database')) {
    channels.push('affiliate', 'membership');
  }
  if (missing.includes('wiki') || missing.includes('guides')) {
    channels.push('sponsorship');
  }
  if (missing.includes('tier-list')) {
    channels.push('ugc');
  }
  return Array.from(new Set(channels));
}

function buildThesis(input: {
  entity: string;
  sources: string[];
  missing: string[];
  seoDifficulty: string;
  rankDelta?: number;
  ageLabel?: string;
}) {
  const gap = input.missing.slice(0, 3).join(' / ') || 'content depth';
  const momentum =
    typeof input.rankDelta === 'number' && input.rankDelta > 0
      ? `rank jumping +${input.rankDelta}`
      : input.sources.includes('roblox-upcoming')
        ? 'up-and-coming Roblox momentum'
        : 'sustained player attention';
  const age = input.ageLabel ? ` Released ${input.ageLabel}.` : '';
  return `${input.entity}: ${momentum}.${age} Missing ${gap}. SEO difficulty ${input.seoDifficulty} — build the thin-content layer players search for after they already love the game.`;
}

function velocityBonus(velocity: RadarOpportunity['velocity']): number {
  if (!velocity) return 0;
  const positive = [velocity.v7d, velocity.v72h, velocity.v24h].find((v) => typeof v === 'number' && v > 0);
  if (typeof positive !== 'number') return 0;
  return Math.min(10, Math.round(Math.log10(positive + 1) * 4));
}

/**
 * V1 评分公式 + 真实快照速度加成（findly 只有 V1 分；velocity 权重由
 * 死代码 brandSearch 的 10 分重分配而来，头注释见 plan）。
 */
export async function scoreGameOpportunities(
  signals: RadarSignal[],
  {
    limit = OPPORTUNITY_LIMIT,
    probeSeoLimit = SEO_PROBE_LIMIT,
    fetchImpl,
    snapshotsBySlug = new Map<string, RadarSnapshotRow[]>(),
    firstSeenBySlug = new Map<string, string>(),
    now = new Date()
  }: {
    limit?: number;
    probeSeoLimit?: number;
    fetchImpl: typeof fetch;
    snapshotsBySlug?: Map<string, RadarSnapshotRow[]>;
    firstSeenBySlug?: Map<string, string>;
    now?: Date;
  }
): Promise<RadarOpportunity[]> {
  // 按实体分组
  const groups = new Map<string, RadarSignal[]>();
  for (const signal of signals) {
    const key = normalizeEntityKey(signal.title);
    if (!key || key.length < 2) continue;
    groups.set(key, [...(groups.get(key) || []), signal]);
  }

  // 平台榜单实体优先
  const rankedKeys = Array.from(groups.entries())
    .map(([key, group]) => {
      const hasPlatform = group.some((s) =>
        ['steam-top', 'steam-growth', 'roblox-trending', 'roblox-upcoming'].includes(s.source)
      );
      const heat = group.reduce((sum, s) => sum + Math.log10(Math.max(s.metricValue, 1) + 1), 0);
      const growth = Math.max(0, ...group.map((s) => s.rankDelta || 0));
      return { key, group, priority: (hasPlatform ? 100 : 0) + heat * 10 + growth };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.max(limit * 2, 20));

  const opportunities: RadarOpportunity[] = [];

  for (const { key, group } of rankedKeys) {
    const primary =
      group.find((s) => s.source.startsWith('steam') || s.source.startsWith('roblox')) || group[0];
    const entity = primary.title;
    const slug = key.replace(/\s+/g, '-').slice(0, 64) || 'game';
    const peakMetric = Math.max(...group.map((s) => s.metricValue || 0));
    const rankDelta = Math.max(0, ...group.map((s) => (typeof s.rankDelta === 'number' ? s.rankDelta : 0)));

    // SEO 探测只花在最有希望的头部实体上（子请求预算）
    const probeIndex = opportunities.length < probeSeoLimit;
    const gap = await analyzeSeoGap(fetchImpl, { entity, peakMetric, probeNetwork: probeIndex });

    const sourceIds = Array.from(new Set(group.map((s) => s.source)));
    const missingScore = gap.missingAssets.length * 8;
    const growthScore = Math.min(30, rankDelta * 2);
    const heatScore = Math.min(35, Math.log10(peakMetric + 10) * 10);
    const multiSourceBonus = sourceIds.length > 1 ? 10 : 0;
    const seoBonus = gap.seoDifficulty === 'low' ? 15 : gap.seoDifficulty === 'medium' ? 8 : 0;
    // 有 wiki 且几乎无缺口的饱和大 IP 降权
    const saturationPenalty = gap.existingAssets.includes('wiki') && gap.missingAssets.length <= 1 ? 12 : 0;

    const snapshotRows = snapshotsBySlug.get(slug) ?? [];
    const velocityInputs: VelocityInput[] = snapshotRows.map((row) => ({
      capturedAt: new Date(row.captured_at).getTime(),
      metric: row.metric == null ? null : Number(row.metric),
      rank: row.rank
    }));
    const velocity = velocityInputs.length >= 2 ? computeVelocity(velocityInputs, now.getTime()) : null;

    const baseScore = Math.round(
      Math.max(1, heatScore + growthScore + missingScore + multiSourceBonus + seoBonus - saturationPenalty)
    );

    const releaseDate = group.find((s) => s.releaseDate)?.releaseDate;
    const comingSoon = group.some((s) => s.comingSoon);
    const ageDays = daysSince(releaseDate, now);
    const freshnessBonus =
      typeof ageDays === 'number' && ageDays >= 0 && ageDays < 90
        ? 8
        : typeof ageDays === 'number' && ageDays >= 0 && ageDays < 365
          ? 3
          : 0;

    const score = Math.min(100, Math.round(Math.max(1, baseScore + freshnessBonus + velocityBonus(velocity))));

    const gates = evaluateGates({
      peakMetric,
      sourceCount: sourceIds.length,
      comingSoon,
      hasSteamSource: sourceIds.some((s) => s.startsWith('steam')),
      velocity,
      daysSinceRelease: ageDays,
      seoDifficulty: gap.seoDifficulty,
      wikiPresent: gap.existingAssets.includes('wiki'),
      missingCount: gap.missingAssets.length
    });
    const events = classifyRadarEvents({
      slug,
      firstSeenAt: firstSeenBySlug.get(slug),
      sources: sourceIds,
      velocity,
      missingAssets: gap.missingAssets,
      now
    });

    opportunities.push({
      id: `opp-${slug}`,
      slug,
      title: entity,
      sources: sourceIds,
      platforms: Array.from(new Set(group.flatMap((s) => s.platforms))),
      score,
      velocity,
      thesis: buildThesis({
        entity,
        sources: sourceIds,
        missing: gap.missingAssets,
        seoDifficulty: gap.seoDifficulty,
        rankDelta: rankDelta || undefined,
        ageLabel: formatAgeLabel(ageDays, comingSoon)
      }),
      whyNow:
        gap.notes[0] ||
        `${sourceIds.join(' + ')} signals show attention. Content layer still incomplete.`,
      allintitleEstimate: gap.allintitleEstimate,
      seoDifficulty: gap.seoDifficulty,
      existingAssets: gap.existingAssets,
      missingAssets: gap.missingAssets,
      monetization: monetizationFor(gap.missingAssets),
      gates: gates.gates,
      decision: gates.decision,
      events,
      recommendations: buildRecommendations({ decision: gates.decision, events, missingAssets: gap.missingAssets, tags: group[0].tags }),
      url: primary.url,
      steamAppId: typeof primary.raw?.appid === 'number' ? primary.raw.appid : undefined,
      robloxUniverseId: typeof primary.raw?.universeId === 'number' ? primary.raw.universeId : undefined,
      releaseDate,
      daysSinceRelease: ageDays,
      latestMetric: peakMetric,
      latestRank: primary.rank,
      rankDelta: rankDelta || undefined
    });
  }

  return opportunities.sort((a, b) => b.score - a.score).slice(0, limit);
}
