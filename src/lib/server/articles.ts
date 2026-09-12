/**
 * [INPUT]: 依赖 ./db 的 withDatabase/queryRows，依赖 ./repositories/tool-repository 的 slugify/generateUniqueSlug
 * [OUTPUT]: 对外提供 validateArticleBody、createArticleDraft、listArticles、getArticleBySlug、publishArticle、deleteArticle、ArticleBody/ArticleCard 类型
 * [POS]: src/lib/server 的文章数据层，被 article-generator.ts（生成草稿）、/blog 路由（前台渲染）、/api/admin/articles（审核）消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { Client, QueryResultRow } from 'pg';
import { queryRows } from './db';
import { generateUniqueSlug, slugify } from './repositories/tool-repository';

// ==================== 类型 ====================

export type ArticleBody = {
  intro: string;
  items: Array<{ toolSlug: string; comment: string }>;
  conclusion: string;
};

export type ArticleCard = {
  slug: string;
  title: string;
  excerpt: string;
  icon: string;
  status: string;
  publishedAt: string | null;
};

// 与 guide 榜单卡（ToolCardDisplay）共用渲染，字段取最小交集，其余可选对齐
export type ArticleTool = {
  slug: string;
  name: string;
  shortDescription: string;
  pricingType: string | null;
  description?: string | null;
  icon?: string | null;
  monthlyVisits?: number;
  comment?: string;
};

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: unknown;
  icon: string;
  status: string;
  published_at: Date | string | null;
};

// ==================== 校验 ====================

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateArticleBody(input: unknown): { valid: boolean; value?: ArticleBody } {
  if (typeof input !== 'object' || input === null) return { valid: false };
  const raw = input as Record<string, unknown>;
  const items = raw.items;
  if (!isNonEmptyString(raw.intro) || !isNonEmptyString(raw.conclusion)) return { valid: false };
  if (!Array.isArray(items) || items.length === 0) return { valid: false };

  const parsedItems: Array<{ toolSlug: string; comment: string }> = [];
  for (const item of items) {
    if (typeof item !== 'object' || item === null) return { valid: false };
    const entry = item as Record<string, unknown>;
    if (!isNonEmptyString(entry.toolSlug) || !isNonEmptyString(entry.comment)) return { valid: false };
    parsedItems.push({ toolSlug: entry.toolSlug.trim(), comment: entry.comment.trim() });
  }

  return {
    valid: true,
    value: { intro: raw.intro.trim(), items: parsedItems, conclusion: raw.conclusion.trim() }
  };
}

// ==================== 写入 ====================

export async function createArticleDraft(
  client: Client,
  input: { title: string; excerpt: string; body: ArticleBody; icon?: string; generatedModel?: string }
): Promise<{ id: string; slug: string }> {
  const baseSlug = slugify(input.title) || 'article';
  const slug = await generateUniqueSlug(client, `ai-${baseSlug}`);

  const result = await client.query<{ id: string; slug: string }>(
    `
      INSERT INTO articles (slug, title, excerpt, body, icon, generated_model, status)
      VALUES ($1, $2, $3, $4::jsonb, $5, $6, 'draft')
      RETURNING id, slug
    `,
    [slug, input.title, input.excerpt, JSON.stringify(input.body), input.icon ?? '🤖', input.generatedModel ?? null]
  );

  return result.rows[0];
}

export async function publishArticle(
  client: Client,
  id: string,
  reviewer: string
): Promise<boolean> {
  const result = await client.query(
    `
      UPDATE articles
      SET status = 'published', reviewed_by = $2, reviewed_at = now(), published_at = now()
      WHERE id = $1 AND status = 'draft'
      RETURNING id
    `,
    [id, reviewer]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteArticle(
  client: Client,
  id: string
): Promise<boolean> {
  const result = await client.query('DELETE FROM articles WHERE id = $1 RETURNING id', [id]);
  return (result.rowCount ?? 0) > 0;
}

// ==================== 读取 ====================

export async function listArticles(
  platform: App.Platform | undefined,
  options: { status?: 'draft' | 'published' } = {}
): Promise<ArticleCard[]> {
  const rows = await queryRows<ArticleRow>(
    platform,
    `
      SELECT id, slug, title, excerpt, body, icon, status, published_at
      FROM articles
      WHERE ($1::text IS NULL OR status = $1)
      ORDER BY created_at DESC
      LIMIT 100
    `,
    [options.status ?? null]
  );

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    icon: row.icon,
    status: row.status,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null
  }));
}

export type ArticlePage = {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    icon: string;
    body: ArticleBody;
    publishedAt: string | null;
  };
  tools: ArticleTool[];
};

export async function getArticleBySlug(
  platform: App.Platform | undefined,
  slug: string
): Promise<ArticlePage | null> {
  const rows = await queryRows<ArticleRow & { generated_model: string | null }>(
    platform,
    'SELECT id, slug, title, excerpt, body, icon, status, published_at FROM articles WHERE slug = $1 LIMIT 1',
    [slug]
  );

  const row = rows[0];
  if (!row || row.status !== 'published') return null;

  const bodyCheck = validateArticleBody(row.body);
  if (!bodyCheck.valid || !bodyCheck.value) return null;

  const slugs = bodyCheck.value.items.map((item) => item.toolSlug);
  const tools = await queryRows<{
    slug: string;
    name: string;
    shortDescription: string;
    pricingType: string | null;
  }>(
    platform,
    `
      SELECT slug, name,
        COALESCE(short_description, description, summary, '') AS "shortDescription",
        pricing_type AS "pricingType"
      FROM tools
      WHERE status = 'published' AND slug = ANY($1)
    `,
    [slugs]
  );

  // 保持 AI 排名顺序
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));

  return {
    article: {
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      icon: row.icon,
      body: bodyCheck.value,
      publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null
    },
    tools: bodyCheck.value.items
      .map((item) => {
        const tool = bySlug.get(item.toolSlug);
        return tool ? { ...tool, comment: item.comment } : null;
      })
      .filter((tool): tool is ArticleTool & { comment: string } => tool !== null)
  };
}
