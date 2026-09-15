import type { Client } from 'pg';
import { connectorFor, type RawTool } from '$lib/connectors';
import { crawlToolWebsite, createRateLimiter, type CrawledPage } from './crawler';
import { extractToolData, type ExtractedTool } from './extractor';
import { findDuplicateTool, normalizeDomain } from './dedupe';
import { scoreAcquiredTool } from './quality';
import { createPublishedTool } from '$lib/server/repositories/tool-repository';

type DataSourceRow = {
  id: string;
  name: string;
  type: string;
  url: string | null;
  api_endpoint: string | null;
};

export type DiscoverySummary = {
  jobsStarted: number;
  itemsFound: number;
  itemsProcessed: number;
  queued: number;
  errors: string[];
};

export type DiscoveryOptions = {
  fetchImpl?: typeof fetch;
  sourceLimit?: number;
  itemLimit?: number;
  crawlDelayMs?: number;
  extractorEndpoint?: string;
  extractorApiKey?: string;
};

async function enabledSources(client: Client, limit: number): Promise<DataSourceRow[]> {
  const result = await client.query<DataSourceRow>(
    `
      SELECT id, name, type, url, api_endpoint
      FROM data_sources
      WHERE enabled = true
      ORDER BY last_sync_at NULLS FIRST, created_at ASC
      LIMIT $1
    `,
    [limit]
  );
  return result.rows;
}

async function createJob(client: Client, sourceId: string): Promise<string> {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO tool_discovery_jobs (source_id, status, started_at)
      VALUES ($1, 'running', now())
      RETURNING id
    `,
    [sourceId]
  );
  return result.rows[0].id;
}

async function finishJob(client: Client, jobId: string, status: 'completed' | 'failed', data: { found: number; processed: number; error?: string }) {
  await client.query(
    `
      UPDATE tool_discovery_jobs
      SET status = $2, finished_at = now(), items_found = $3, items_processed = $4, error_message = $5
      WHERE id = $1
    `,
    [jobId, status, data.found, data.processed, data.error ?? null]
  );
}

async function queueImport(
  client: Client,
  source: DataSourceRow,
  jobId: string,
  raw: RawTool,
  page: CrawledPage,
  extracted: ExtractedTool,
  qualityScore: number,
  duplicateToolId: string | null
) {
  await client.query(
    `
      INSERT INTO tool_import_queue (
        source_id, discovery_job_id, raw_data, crawled_data, extracted_data,
        quality_score, duplicate_tool_id, status
      )
      VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, 'pending')
      ON CONFLICT ((lower(raw_data->>'url'))) WHERE status = 'pending' AND raw_data ? 'url'
      DO UPDATE SET
        crawled_data = EXCLUDED.crawled_data,
        extracted_data = EXCLUDED.extracted_data,
        quality_score = EXCLUDED.quality_score,
        duplicate_tool_id = EXCLUDED.duplicate_tool_id,
        updated_at = now()
    `,
    [
      source.id,
      jobId,
      JSON.stringify(raw),
      JSON.stringify(page),
      JSON.stringify(extracted),
      qualityScore,
      duplicateToolId
    ]
  );
}

export async function runDiscovery(client: Client, options: DiscoveryOptions = {}): Promise<DiscoverySummary> {
  const sources = await enabledSources(client, options.sourceLimit ?? 6);
  const summary: DiscoverySummary = { jobsStarted: 0, itemsFound: 0, itemsProcessed: 0, queued: 0, errors: [] };
  const rateLimitCrawl = createRateLimiter(options.crawlDelayMs ?? 200);

  for (const source of sources) {
    const connector = connectorFor(source.type);
    if (!connector) continue;
    const jobId = await createJob(client, source.id);
    summary.jobsStarted += 1;
    let found = 0;
    let processed = 0;

    try {
      const rawTools = await connector.fetchTools({
        fetchImpl: options.fetchImpl,
        limit: options.itemLimit ?? 100,
        endpoint: source.api_endpoint ?? undefined,
        url: source.url ?? undefined
      });
      found = rawTools.length;
      summary.itemsFound += found;

      for (const raw of rawTools.slice(0, options.itemLimit ?? 100)) {
        try {
          await rateLimitCrawl();
          const page = await crawlToolWebsite(raw.url, { fetchImpl: options.fetchImpl, timeoutMs: 4_000, retries: 1 });
          const extracted = await extractToolData(raw, page, {
            fetchImpl: options.fetchImpl,
            endpoint: options.extractorEndpoint,
            apiKey: options.extractorApiKey
          });
          const duplicate = await findDuplicateTool(client, { name: extracted.name, url: raw.url });
          const quality = scoreAcquiredTool(page, extracted);
          await queueImport(client, source, jobId, raw, page, extracted, quality.score, duplicate.tool?.id ?? null);
          processed += 1;
          summary.itemsProcessed += 1;
          summary.queued += 1;
        } catch (error) {
          summary.errors.push(`${raw.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      await finishJob(client, jobId, 'completed', { found, processed });
      await client.query('UPDATE data_sources SET last_sync_at = now() WHERE id = $1', [source.id]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      summary.errors.push(`${source.name}: ${message}`);
      await finishJob(client, jobId, 'failed', { found, processed, error: message });
    }
  }

  return summary;
}

export async function listDiscoveryJobs(client: Client) {
  const result = await client.query(`
    SELECT
      j.id,
      j.status,
      j.started_at,
      j.finished_at,
      j.items_found,
      j.items_processed,
      j.error_message,
      s.name AS source_name,
      s.type AS source_type
    FROM tool_discovery_jobs j
    LEFT JOIN data_sources s ON s.id = j.source_id
    ORDER BY j.created_at DESC
    LIMIT 100
  `);
  return result.rows;
}

export async function listImports(client: Client, status = 'pending') {
  const result = await client.query(
    `
      SELECT
        q.id,
        q.raw_data,
        q.extracted_data,
        q.quality_score,
        q.status,
        q.error_message,
        q.created_at,
        s.name AS source_name,
        duplicate.slug AS duplicate_slug,
        duplicate.name AS duplicate_name
      FROM tool_import_queue q
      LEFT JOIN data_sources s ON s.id = q.source_id
      LEFT JOIN tools duplicate ON duplicate.id = q.duplicate_tool_id
      WHERE ($1 = 'all' OR q.status = $1)
      ORDER BY q.quality_score DESC NULLS LAST, q.created_at DESC
      LIMIT 200
    `,
    [status]
  );
  return result.rows;
}

export async function pipelineMetrics(client: Client) {
  const result = await client.query(`
    SELECT
      (SELECT count(*)::int FROM tool_import_queue WHERE created_at >= date_trunc('day', now())) AS discovered_today,
      (SELECT count(*)::int FROM tool_import_queue WHERE extracted_data <> '{}'::jsonb AND created_at >= date_trunc('day', now())) AS extracted_today,
      (SELECT count(*)::int FROM tool_import_queue WHERE status = 'pending') AS pending,
      (SELECT count(*)::int FROM tool_import_queue WHERE status = 'approved' AND reviewed_at >= date_trunc('day', now())) AS published_today,
      (SELECT count(*)::int FROM tool_discovery_jobs WHERE status = 'failed' AND created_at >= date_trunc('day', now())) AS failed_jobs
  `);
  const sources = await client.query(`
    SELECT id, name, type, enabled, last_sync_at
    FROM data_sources
    ORDER BY enabled DESC, name ASC
  `);
  return { ...result.rows[0], sources: sources.rows };
}

export async function approveImport(client: Client, id: string) {
  await client.query('BEGIN');
  try {
    const result = await client.query<{
      raw_data: RawTool;
      extracted_data: ExtractedTool;
      duplicate_tool_id: string | null;
    }>('SELECT raw_data, extracted_data, duplicate_tool_id FROM tool_import_queue WHERE id = $1 AND status = $2 FOR UPDATE', [id, 'pending']);
    const item = result.rows[0];
    if (!item) {
      await client.query('ROLLBACK');
      return null;
    }
    if (item.duplicate_tool_id) {
      await client.query(
        'UPDATE tool_import_queue SET status = $2, error_message = $3, reviewed_at = now() WHERE id = $1',
        [id, 'rejected', 'Duplicate tool detected during acquisition review']
      );
      await client.query('COMMIT');
      return null;
    }

    const tool = await createPublishedTool(client, {
      name: item.extracted_data.name,
      website: item.raw_data.url,
      description: item.extracted_data.description,
      category: item.extracted_data.category,
      sourceSubmissionId: null
    });
    const domain = normalizeDomain(item.raw_data.url);
    await client.query(
      `
        UPDATE tools
        SET
          short_description = COALESCE(short_description, $2),
          website_url = COALESCE(website_url, $3),
          normalized_domain = COALESCE(normalized_domain, $4),
          pricing_type = COALESCE(pricing_type, $5),
          tool_metadata = $6::jsonb,
          is_verified = false
        WHERE id = $1
      `,
      [
        tool.id,
        item.extracted_data.description.slice(0, 180),
        item.raw_data.url,
        domain,
        item.extracted_data.pricing,
        JSON.stringify({
          features: item.extracted_data.features,
          use_cases: item.extracted_data.use_cases,
          target_users: item.extracted_data.target_users,
          platforms: item.extracted_data.platforms
        })
      ]
    );
    await client.query('UPDATE tool_import_queue SET status = $2, reviewed_at = now() WHERE id = $1', [id, 'approved']);
    await client.query('COMMIT');
    return tool;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  }
}

export async function rejectImport(client: Client, id: string, reason?: string) {
  const result = await client.query(
    `
      UPDATE tool_import_queue
      SET status = 'rejected', error_message = $2, reviewed_at = now()
      WHERE id = $1 AND status = 'pending'
      RETURNING id, status
    `,
    [id, reason ?? null]
  );
  return result.rows[0] ?? null;
}

// ==================== 质量分自动批准 ====================

// 聚合/UGC 域名不是独立工具站，永不自动发布（留 pending 人工审）
const AGGREGATOR_DOMAINS = new Set([
  'github.com',
  'news.ycombinator.com',
  'reddit.com',
  'medium.com',
  'dev.to',
  'producthunt.com',
  'youtube.com',
  'twitter.com',
  'x.com'
]);

export type AutoApproveSummary = {
  evaluated: number;
  approved: Array<{ id: string; name: string; slug: string }>;
  rejectedDuplicates: number;
  errors: string[];
};

export async function autoApproveImports(
  client: Client,
  options: { minScore: number; limit?: number }
): Promise<AutoApproveSummary> {
  const summary: AutoApproveSummary = { evaluated: 0, approved: [], rejectedDuplicates: 0, errors: [] };

  const result = await client.query<{ id: string; name: string; url: string }>(
    `
      SELECT id, extracted_data->>'name' AS name, raw_data->>'url' AS url
      FROM tool_import_queue
      WHERE status = 'pending'
        AND quality_score >= $1
        AND extracted_data ? 'name'
        AND raw_data ? 'url'
      ORDER BY quality_score DESC, created_at ASC
      LIMIT $2
    `,
    [options.minScore, options.limit ?? 50]
  );

  for (const row of result.rows) {
    summary.evaluated += 1;
    try {
      // 聚合站条目（GitHub 仓库/HN 帖子等）不是工具站，留 pending 人工审
      if (AGGREGATOR_DOMAINS.has(normalizeDomain(row.url))) {
        continue;
      }
      // 复核去重：入队时的标记可能已过时（同域工具可能刚被发布）
      const duplicate = await findDuplicateTool(client, { name: row.name, url: row.url });
      if (duplicate.duplicate) {
        await rejectImport(client, row.id, `Auto-rejected: duplicate of ${duplicate.tool?.slug ?? 'unknown'}`);
        summary.rejectedDuplicates += 1;
        continue;
      }
      const tool = await approveImport(client, row.id);
      if (tool) summary.approved.push({ id: row.id, name: row.name, slug: tool.slug });
    } catch (error) {
      // 唯一索引冲突 = 并发/漏判的重复域名，降级为重复拒绝而不是报错
      if ((error as { code?: string })?.code === '23505') {
        await rejectImport(client, row.id, 'Auto-rejected: duplicate domain (unique index)');
        summary.rejectedDuplicates += 1;
        continue;
      }
      summary.errors.push(`${row.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return summary;
}
