import type { QueryResult, QueryResultRow } from 'pg';

type Queryable = {
  query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
};

// ==================== 类型定义 ====================
export type PublishedToolInput = {
  name: string;
  website: string;
  description?: string;
  category?: string | null;
  sourceSubmissionId?: string | null;
};

// ==================== 工具函数 ====================

/**
 * 将文本转换为 URL 友好的 slug
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * 生成唯一的 slug，如果存在冲突则添加数字后缀
 * @param pool - 数据库连接池
 * @param baseSlug - 基础 slug
 * @returns 唯一的 slug
 */
export async function generateUniqueSlug(db: Queryable, baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let suffix = 1;

  // 检查 slug 是否已存在，如果存在则添加后缀
  while (true) {
    const result = await db.query(
      'SELECT id FROM tools WHERE slug = $1 LIMIT 1',
      [slug]
    );

    if (result.rows.length === 0) {
      return slug; // slug 唯一，返回
    }

    // slug 冲突，添加后缀重试
    slug = `${baseSlug}-${suffix}`;
    suffix++;

    // 防止无限循环，最多尝试 100 次
    if (suffix > 100) {
      throw new Error('Unable to generate unique slug after 100 attempts');
    }
  }
}

// ==================== 主要导出函数 ====================

/**
 * 创建已发布的工具
 * @param pool - 数据库连接池
 * @param input - 工具输入数据
 * @returns 创建的工具记录
 */
export async function createPublishedTool(db: Queryable, input: PublishedToolInput) {
  const baseSlug = slugify(input.name) || 'tool';
  const slug = await generateUniqueSlug(db, baseSlug);
  const domain = new URL(input.website).hostname.replace(/^www\./, '');
  const description = input.description?.trim() || `${input.name} submitted to AppSearchly for review and publication.`;
  // tools_summary_check requires summary >= 20 characters
  const summary = description.length >= 20 ? description : `${input.name}: ${description}`;

  const result = await db.query(
    `INSERT INTO tools
      (
        slug,
        name,
        summary,
        official_url,
        canonical_domain,
        status,
        primary_source_url,
        primary_source_type,
        source_checked_at,
        published_at,
        website,
        normalized_domain,
        description,
        category,
        source_submission_id
      )
     VALUES ($1,$2,$3,$4,$5,'published',$4,'owner_submission',now(),now(),$4,$6,$7,$8,$9)
     RETURNING id, slug, status`,
    [
      slug,
      input.name,
      summary,
      input.website,
      domain, // canonical_domain (citext)
      domain, // normalized_domain (text)
      description,
      input.category ?? null,
      input.sourceSubmissionId ?? null,
    ],
  );

  return result.rows[0];
}
