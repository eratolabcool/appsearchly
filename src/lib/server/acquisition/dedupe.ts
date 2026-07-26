import type { Queryable } from '$lib/server/repositories/tool-entity-repository';

export function normalizeDomain(value: string): string {
  const url = new URL(value);
  return url.hostname.toLowerCase().replace(/^www\./, '').replace(/^chat\./, '');
}

function tokens(value: string): Set<string> {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter(Boolean));
}

export function nameSimilarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

export async function findDuplicateTool(db: Queryable, input: { name: string; url: string }) {
  const domain = normalizeDomain(input.url);
  const direct = await db.query<{ id: string; name: string; slug: string; normalized_domain: string }>(
    `
      SELECT id, name, slug, COALESCE(normalized_domain, canonical_domain) AS normalized_domain
      FROM tools
      WHERE lower(COALESCE(normalized_domain, canonical_domain)) = $1
      LIMIT 1
    `,
    [domain]
  );
  if (direct.rows[0]) return { duplicate: true, reason: 'domain', tool: direct.rows[0], score: 1 };

  const candidates = await db.query<{ id: string; name: string; slug: string; normalized_domain: string }>(
    `
      SELECT id, name, slug, COALESCE(normalized_domain, canonical_domain) AS normalized_domain
      FROM tools
      WHERE status = 'published'
      ORDER BY updated_at DESC
      LIMIT 500
    `
  );
  const best = candidates.rows
    .map((tool) => ({ tool, score: nameSimilarity(input.name, tool.name) }))
    .sort((left, right) => right.score - left.score)[0];

  if (best && best.score >= 0.82) {
    return { duplicate: true, reason: 'name_similarity', tool: best.tool, score: best.score };
  }

  return { duplicate: false, reason: null, tool: null, score: best?.score ?? 0 };
}
