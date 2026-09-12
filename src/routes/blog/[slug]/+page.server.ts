import { error } from '@sveltejs/kit';
import { getGuide } from '$lib/server/guides';
import { listToolsData } from '$lib/server/data-access';
import { getArticleBySlug } from '$lib/server/articles';

export const prerender = false;

export async function load({ params, platform }) {
  // AI 生成文章优先，guides 硬编码榜单兜底
  try {
    const articlePage = await getArticleBySlug(platform, params.slug);
    if (articlePage) {
      return { kind: 'article' as const, ...articlePage };
    }
  } catch {
    // DB 不可用时继续走 guides
  }

  const guide = getGuide(params.slug);
  if (!guide) {
    throw error(404, 'Guide not found');
  }

  const result = await listToolsData(platform, {
    category: guide.category ?? undefined,
    sort: guide.sort,
    pageSize: 24
  });

  return { kind: 'guide' as const, guide, tools: result.tools, toolCount: result.pagination.total };
}
