import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Legacy route: /submit-app -> canonical /submit
export const load: PageServerLoad = () => {
  throw redirect(301, '/submit');
};
