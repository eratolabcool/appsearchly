import { queryRows } from '$lib/server/db';

export interface CreateSubmissionInput {
  submittedUrl: string;
  submittedName: string | null;
  submitterEmail: string | null;
  submitterName: string | null;
  rawPayload: Record<string, unknown>;
}

export interface SubmissionRecord {
  id: string;
  submittedUrl: string;
  submittedName: string | null;
  submitterEmail: string | null;
  submitterName: string | null;
  normalizedDomain: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeDomain(value: string): string {
  return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
}

export async function createSubmission(
  platform: App.Platform | undefined,
  input: CreateSubmissionInput
): Promise<SubmissionRecord> {
  const normalizedDomain = normalizeDomain(input.submittedUrl);
  const rows = await queryRows<{
    id: string;
    submitted_url: string;
    submitted_name: string | null;
    submitter_email: string | null;
    submitter_name: string | null;
    normalized_domain: string | null;
    status: string;
    created_at: Date;
    updated_at: Date;
  }>(
    platform,
    `
      INSERT INTO submissions (
        submitted_url,
        submitted_name,
        submitter_email,
        submitter_name,
        normalized_domain,
        raw_payload,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, 'pending')
      RETURNING
        id,
        submitted_url,
        submitted_name,
        submitter_email,
        submitter_name,
        normalized_domain,
        status,
        created_at,
        updated_at
    `,
    [
      input.submittedUrl,
      input.submittedName,
      input.submitterEmail,
      input.submitterName,
      normalizedDomain,
      JSON.stringify(input.rawPayload)
    ]
  );

  const row = rows[0];
  if (!row) throw new Error('Submission insert did not return a record.');

  return {
    id: row.id,
    submittedUrl: row.submitted_url,
    submittedName: row.submitted_name,
    submitterEmail: row.submitter_email,
    submitterName: row.submitter_name,
    normalizedDomain: row.normalized_domain,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

export async function listSubmissions(
  platform: App.Platform | undefined,
  options: { status?: string; limit: number; offset: number }
): Promise<{ items: SubmissionRecord[]; total: number }> {
  const status = options.status && options.status !== 'all' ? options.status : null;
  const rows = await queryRows<{
    id: string;
    submitted_url: string;
    submitted_name: string | null;
    submitter_email: string | null;
    submitter_name: string | null;
    normalized_domain: string | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    total_count: string;
  }>(
    platform,
    `
      SELECT
        id,
        submitted_url,
        submitted_name,
        submitter_email,
        submitter_name,
        normalized_domain,
        status,
        created_at,
        updated_at,
        count(*) OVER()::text AS total_count
      FROM submissions
      WHERE ($1::text IS NULL OR status = $1)
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [status, options.limit, options.offset]
  );

  return {
    items: rows.map((row) => ({
      id: row.id,
      submittedUrl: row.submitted_url,
      submittedName: row.submitted_name,
      submitterEmail: row.submitter_email,
      submitterName: row.submitter_name,
      normalizedDomain: row.normalized_domain,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    })),
    total: Number(rows[0]?.total_count ?? 0)
  };
}
