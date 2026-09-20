/**
 * [INPUT]: itch.io 公开 RSS（fetchImpl 注入）
 * [OUTPUT]: 对外提供 fetchItchRadarSignals → itch 新热 HTML5 游戏信号
 * [POS]: src/lib/server/radar/sources 的 itch.io 源，由 pipeline settleSource 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { RadarSignal } from '../types';

const UA = 'AppSearchlyRadar/1.0 (+https://www.appsearchly.com; game-opportunity-radar)';

export async function fetchItchRadarSignals(
  fetchImpl: typeof fetch,
  { limit = 25 }: { limit?: number } = {}
): Promise<RadarSignal[]> {
  const response = await fetchImpl('https://itch.io/games/new-and-popular/platform-web.xml', {
    headers: { 'User-Agent': UA, Accept: 'application/rss+xml, text/xml, */*' }
  });
  if (!response.ok) {
    throw new Error(`itch.io returned status ${response.status}`);
  }

  const xml = await response.text();
  const capturedAt = new Date().toISOString();
  const signals: RadarSignal[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && signals.length < limit) {
    const item = match[1];
    const titleMatch = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i.exec(item);
    const linkMatch = /<link>(.*?)<\/link>/i.exec(item);
    const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(item);

    const title = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
    const url = (linkMatch?.[1] || '').trim();
    const pubDate = pubDateMatch?.[1] ? new Date(pubDateMatch[1]).toISOString() : null;
    if (!title || !url) continue;

    signals.push({
      id: `itch-${signals.length}-${title.slice(0, 32)}`,
      source: 'itch',
      title,
      url,
      metricLabel: 'popularity',
      metricValue: limit - signals.length,
      releaseDate: pubDate ? pubDate.split('T')[0] : undefined,
      platforms: ['browser'],
      tags: ['html5', 'itch', 'indie'],
      capturedAt,
      raw: { externalUrl: url }
    });
  }

  if (signals.length === 0) {
    throw new Error('itch.io RSS returned no usable items');
  }
  return signals;
}
