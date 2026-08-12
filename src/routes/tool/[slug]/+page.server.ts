import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Legacy route: /tool/[slug] -> canonical /tools/[slug]
export const load: PageServerLoad = ({ params }) => {
  throw redirect(301, `/tools/${encodeURIComponent(params.slug)}`);
};
