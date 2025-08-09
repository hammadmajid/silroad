import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Server-side check for SEO and initial render
	// Client-side protection handled by useProtectedRoute hook
	if (!locals.user) {
		throw redirect(303, '/login');
	}
};
