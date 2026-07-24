import type { Pool } from 'pg';

export type PublishedToolInput = {
  name: string;
  website: string;
  description?: string;
  category?: string | null;
  sourceSubmissionId?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export async function createPublishedTool(pool: Pool, input: PublishedToolInput) {
  const slug = slugify(input.name);
  const domain = new URL(input.website).hostname.replace(/^www\./, '');

  const result = await pool.query(
    `INSERT INTO tools
      (slug, name, website, normalized_domain, description, category, source_submission_id, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'published')
     RETURNING id, slug, status`,
    [
      slug,
      input.name,
      input.website,
      domain,
      input.description ?? '',
      input.category ?? null,
      input.sourceSubmissionId ?? null,
    ],
  );

  return result.rows[0];
}
