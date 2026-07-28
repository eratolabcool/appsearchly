import type { Queryable, ToolDetail, ToolListItem } from '$lib/server/repositories/tool-entity-repository';
import { getToolBySlug, listTools } from '$lib/server/repositories/tool-entity-repository';

export type IndexDecision = { indexable: boolean; reasons: string[] };

export function assessToolIndexability(tool: ToolDetail, relatedCount = tool.alternatives.length): IndexDecision {
  const reasons: string[] = [];
  if ((tool.description?.trim().length ?? 0) < 80) reasons.push('description_too_short');
  if (!tool.categories.length) reasons.push('missing_category');
  if (!tool.features.length) reasons.push('missing_features');
  if (relatedCount < 2) reasons.push('insufficient_related_tools');
  return { indexable: reasons.length === 0, reasons };
}

export function assessCategoryIndexability(total: number, description?: string | null): IndexDecision {
  const reasons: string[] = [];
  if (total < 3) reasons.push('insufficient_tools');
  if ((description?.trim().length ?? 0) < 40) reasons.push('description_too_short');
  return { indexable: reasons.length === 0, reasons };
}

export async function getAlternativesPage(db: Queryable, slug: string) {
  const tool = await getToolBySlug(db, slug);
  if (!tool) return null;
  const category = tool.categories[0]?.slug ?? null;
  const related = await listTools(db, { category, sort: 'popular', page: 1, pageSize: 12 });
  const alternatives = related.tools.filter((item) => item.id !== tool.id).slice(0, 10);
  return { tool, alternatives, index: assessToolIndexability(tool, alternatives.length) };
}

export async function getComparisonPage(db: Queryable, leftSlug: string, rightSlug: string) {
  if (!leftSlug || !rightSlug || leftSlug === rightSlug) return null;
  const [left, right] = await Promise.all([getToolBySlug(db, leftSlug), getToolBySlug(db, rightSlug)]);
  if (!left || !right) return null;
  const sharedCategories = left.categories.filter((a) => right.categories.some((b) => b.id === a.id));
  const sharedFeatures = left.features.filter((a) => right.features.some((b) => b.id === a.id));
  const indexable = assessToolIndexability(left).indexable && assessToolIndexability(right).indexable;
  return { left, right, sharedCategories, sharedFeatures, index: { indexable, reasons: indexable ? [] : ['insufficient_tool_data'] } };
}

export function comparisonPath(left: ToolListItem | ToolDetail, right: ToolListItem | ToolDetail) {
  return `/compare/${left.slug}-vs-${right.slug}`;
}
