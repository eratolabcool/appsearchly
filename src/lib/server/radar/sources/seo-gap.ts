/**
 * [INPUT]: 游戏实体名 + 可选网络 HEAD 探测（fetchImpl 注入）
 * [OUTPUT]: 对外提供 analyzeSeoGap → Wiki/Database/Calculator 缺口与 SEO 难度估计
 * [POS]: src/lib/server/radar/sources 的 SEO 缺口分析（allintitle 启发式，非 Google 官方）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { AssetGap, SeoDifficulty, SeoGapAnalysis } from '../types';

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function estimateAllintitle(entity: string, peakMetric: number) {
  // 代理：受众越大 → SERP 越拥挤 → allintitle 竞争越高
  const base = Math.max(3, Math.round(Math.log10(Math.max(peakMetric, 10)) * 18));
  const wordPenalty = entity.split(/\s+/).length >= 3 ? 0.55 : 1;
  return Math.max(2, Math.round(base * wordPenalty));
}

function estimateSeoDifficulty(allintitle: number, peakMetric: number): SeoDifficulty {
  if (peakMetric > 200_000 || allintitle > 80) return 'high';
  if (peakMetric > 30_000 || allintitle > 30) return 'medium';
  return 'low';
}

async function headOk(fetchImpl: typeof fetch, url: string): Promise<boolean> {
  try {
    const response = await fetchImpl(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(3500),
      headers: { 'User-Agent': 'AppSearchlyRadar/1.0 (+https://www.appsearchly.com)' }
    });
    return response.ok || response.status === 405 || response.status === 403;
  } catch {
    return false;
  }
}

/** 探测游戏实体周边的免费内容资产。仅 HEAD — 永不抓取 HTML 正文。 */
export async function analyzeSeoGap(
  fetchImpl: typeof fetch,
  {
    entity,
    peakMetric = 1000,
    probeNetwork = true
  }: { entity: string; peakMetric?: number; probeNetwork?: boolean }
): Promise<SeoGapAnalysis> {
  const slug = slugify(entity);
  const allintitleEstimate = estimateAllintitle(entity, peakMetric);
  const seoDifficulty = estimateSeoDifficulty(allintitleEstimate, peakMetric);
  const notes: string[] = [];
  const existing: AssetGap[] = [];
  const candidates: AssetGap[] = ['wiki', 'database', 'calculator', 'tier-list', 'guides'];

  if (probeNetwork && slug) {
    const wikiHits = await Promise.all([
      headOk(fetchImpl, `https://${slug}.fandom.com/`),
      headOk(fetchImpl, `https://${slug}.wiki.gg/`)
    ]);
    if (wikiHits.some(Boolean)) {
      existing.push('wiki');
      notes.push('Detected existing fan wiki (fandom/wiki.gg).');
    }
    if (peakMetric > 80_000) {
      existing.push('guides');
      notes.push('Large audience likely already has YouTube/guide coverage.');
    }
  } else if (peakMetric > 100_000) {
    existing.push('wiki', 'guides');
    notes.push('Heuristic: mega-title usually has wiki + guides.');
  }

  const missingAssets = candidates.filter((a) => !existing.includes(a));
  if (existing.includes('wiki') && missingAssets.includes('calculator')) {
    notes.push('Wiki exists → calculator / database / tier-list often under-served.');
  }
  if (!existing.includes('wiki') && peakMetric > 5_000) {
    notes.push('No obvious wiki → wiki + SEO content site is a viable wedge.');
  }

  return {
    entity,
    slug,
    allintitleEstimate,
    seoDifficulty,
    existingAssets: existing,
    missingAssets,
    notes
  };
}
