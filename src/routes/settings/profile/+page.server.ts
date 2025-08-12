import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	// Server-side check for SEO and initial render
	// Client-side protection handled by useProtectedRoute hook
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}
};
