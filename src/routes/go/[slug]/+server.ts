/**
 * [INPUT]: 依赖 $lib/server/data-access 的 getToolBySlugData，依赖 $lib/server/db 的 withDatabase
 * [OUTPUT]: GET /go/[slug] — 外链跳转（302 → 工具官网），点击入 outbound_clicks
 * [POS]: routes/go 的唯一端点，让所有站外点击经本站域名中转（曝光/统计/联盟位），被 AppCard、TrendingAI、工具详情页消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { redirect } from '@sveltejs/kit';
import { getToolBySlugData } from '$lib/server/data-access';
import { isDatabaseConfigured, withDatabase } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const prerender = false;

export const GET: RequestHandler = async ({ params, platform, url, request }) => {
  const tool = await getToolBySlugData(platform, params.slug);
  const destination = tool?.affiliateUrl || tool?.websiteUrl || '';

  if (!tool || !/^https?:\/\//.test(destination)) {
    throw redirect(302, '/');
  }

  // 点击统计失败不影响跳转
  if (isDatabaseConfigured(platform)) {
    try {
      const referer = request.headers.get('referer') ?? url.searchParams.get('ref') ?? null;
      await withDatabase(platform, (client) =>
        client.query(
          'INSERT INTO outbound_clicks (tool_id, destination_url, source_path) VALUES ($1, $2, $3)',
          [tool.id, destination, referer]
        )
      );
    } catch (error) {
      console.warn('Outbound click tracking failed:', error);
    }
  }

  throw redirect(302, destination);
};
