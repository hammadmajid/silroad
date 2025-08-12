import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;

	// Server-side check for SEO and initial render
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	return {
		user: locals.user
	};
};
