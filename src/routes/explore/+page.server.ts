import { getDb } from '$lib/db';
import { events, organizations } from '$lib/db/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, platform }) => {
	const db = getDb(platform);

	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Return promises instead of awaited results to allow component-level loading states
	return {
		events: db.select().from(events).limit(5),
		orgs: db.select().from(organizations).limit(5)
	}
};
