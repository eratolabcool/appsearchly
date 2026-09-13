import { json, type RequestHandler } from '@sveltejs/kit';
import { isAdminAuthorized } from '$lib/server/admin-auth';
import { withDatabase } from '$lib/server/db';

const ALLOWED_STATUS = new Set(['draft', 'needs_review', 'published', 'suspended', 'archived']);
const ALLOWED_PRICING = new Set(['free', 'freemium', 'paid', 'subscription', 'usage_based', 'contact_sales', 'unknown']);

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
  if (!isAdminAuthorized(request, platform)) return json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return json({ error: 'invalid_payload' }, { status: 400 });

  const status = typeof body.status === 'string' && ALLOWED_STATUS.has(body.status) ? body.status : null;
  const pricingType = typeof body.pricingType === 'string' && ALLOWED_PRICING.has(body.pricingType) ? body.pricingType : null;
  const isVerified = typeof body.isVerified === 'boolean' ? body.isVerified : null;
  const dataConfidence = Number.isFinite(body.dataConfidence) ? Math.min(Math.max(Math.floor(body.dataConfidence), 0), 100) : null;

  try {
    const item = await withDatabase(platform, async (client) => {
      const result = await client.query(
        `
          UPDATE tools
          SET
            status = COALESCE($2, status),
            pricing_type = COALESCE($3, pricing_type),
            pricing_model = COALESCE($3, pricing_model),
            is_verified = COALESCE($4, is_verified),
            data_confidence = COALESCE($5, data_confidence),
            updated_at = now()
          WHERE id = $1
          RETURNING id, name, slug, status, pricing_type, is_verified, data_confidence
        `,
        [params.id, status, pricingType, isVerified, dataConfidence]
      );
      return result.rows[0];
    });

    if (!item) return json({ error: 'tool_not_found' }, { status: 404 });
    return json({ item });
  } catch (error) {
    console.error('Admin tool update failed:', error);
    return json({ error: 'database_unavailable' }, { status: 503 });
  }
};
