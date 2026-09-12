/**
 * [INPUT]: 依赖 ./articles 的 validateArticleBody/createArticleDraft，依赖 pg Client
 * [OUTPUT]: 对外提供 generateWeeklyArticleDraft、AIRun 类型
 * [POS]: src/lib/server 的 AI 内容生产模块，被 cron.ts 的 runWeeklyArticleCron 消费；AI 只写文案，事实（工具清单）来自 DB
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import type { Client } from 'pg';
import { createArticleDraft, validateArticleBody, type ArticleBody } from './articles';

export type AIRun = (
  model: string,
  input: { messages: Array<{ role: string; content: string }>; max_tokens?: number }
) => Promise<{ response?: string }>;

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

type CandidateTool = {
  slug: string;
  name: string;
  summary: string;
};

type ArticleDraftResult = { slug: string; title: string } | { skipped: string };

async function pickTopCategory(client: Client): Promise<{ category: string; count: number } | null> {
  const result = await client.query<{ category: string; count: number }>(
    `
      SELECT category, count(*)::int AS count
      FROM tools
      WHERE status = 'published' AND category IS NOT NULL
      GROUP BY category
      HAVING count(*) >= 5
      ORDER BY count DESC
      LIMIT 1
    `
  );
  return result.rows[0] ?? null;
}

async function pickTools(client: Client, category: string, topN: number): Promise<CandidateTool[]> {
  const result = await client.query<CandidateTool>(
    `
      SELECT slug, name, summary
      FROM tools
      WHERE status = 'published' AND category = $1
      ORDER BY is_verified DESC, updated_at DESC
      LIMIT $2
    `,
    [category, topN]
  );
  return result.rows;
}

function buildPrompt(category: string, tools: CandidateTool[]): string {
  const listing = tools
    .map((tool) => `- slug: ${tool.slug} | name: ${tool.name} | summary: ${tool.summary}`)
    .join('\n');

  return [
    `You are the editor of AppSearchly, a directory of AI tools. Write a ranked listicle article titled around "Top ${tools.length} ${category} AI Tools".`,
    '',
    'You MUST only write about the tools below. Use each tool slug EXACTLY as given (verbatim, character for character). Do not invent tools, metrics, or reviews.',
    '',
    listing,
    '',
    'Respond with ONLY a JSON object, no markdown fences, in this exact shape:',
    '{"title": string, "excerpt": string, "intro": string, "items": [{"toolSlug": string, "comment": string}], "conclusion": string}',
    'Rules: title < 80 chars; excerpt < 160 chars; intro and conclusion 2-3 sentences each; one short comment per tool, ordered from rank 1 to last.'
  ].join('\n');
}

function parseAiResponse(content: string, allowedSlugs: Set<string>): { title: string; excerpt: string; body: ArticleBody } | null {
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  if (start === -1 || end <= start) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(content.slice(start, end + 1));
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;
  const record = parsed as Record<string, unknown>;
  const bodyCheck = validateArticleBody(record);
  if (!bodyCheck.valid || !bodyCheck.value) return null;

  // 防幻觉：每个 toolSlug 必须逐字来自提供清单
  const hasForeignSlug = bodyCheck.value.items.some((item) => !allowedSlugs.has(item.toolSlug));
  if (hasForeignSlug) return null;

  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const excerpt = typeof record.excerpt === 'string' ? record.excerpt.trim() : '';
  if (!title || !excerpt) return null;

  return { title, excerpt, body: bodyCheck.value };
}

export async function generateWeeklyArticleDraft(
  client: Client,
  options: { aiRun: AIRun; model?: string; topN?: number }
): Promise<ArticleDraftResult> {
  const model = options.model || DEFAULT_MODEL;
  const topN = options.topN && options.topN > 0 ? Math.min(options.topN, 20) : 10;

  const category = await pickTopCategory(client);
  if (!category) return { skipped: 'no category with >= 5 published tools' };

  const tools = await pickTools(client, category.category, topN);
  if (tools.length < 5) return { skipped: `only ${tools.length} published tools in ${category.category}` };

  const allowedSlugs = new Set(tools.map((tool) => tool.slug));
  const messages = [
    { role: 'system', content: 'You write factual, data-driven listicle articles for a tool directory. You always answer with valid JSON only.' },
    { role: 'user', content: buildPrompt(category.category, tools) }
  ];

  // 失败重试 1 次（LLM JSON 输出不稳定，网络/模型异常同样重试）
  for (let attempt = 0; attempt < 2; attempt++) {
    let response: { response?: string } | null = null;
    try {
      response = await options.aiRun(model, { messages, max_tokens: 2048 });
    } catch {
      continue;
    }
    const parsed = response?.response ? parseAiResponse(response.response, allowedSlugs) : null;
    if (!parsed) continue;

    const draft = await createArticleDraft(client, {
      title: parsed.title,
      excerpt: parsed.excerpt,
      body: parsed.body,
      generatedModel: model
    });
    return { slug: draft.slug, title: parsed.title };
  }

  return { skipped: 'AI output failed validation after retry' };
}
