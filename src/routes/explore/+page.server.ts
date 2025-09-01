import { events } from '$lib/db/schema';
import { getDb } from '$lib/db';
import { organizations } from '$lib/db/schema';
import { asc, gte } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	const now = new Date();
	const limit = 5;

	return {
		events: db
			.select()
			.from(events)
			.where(gte(events.dateOfEvent, now))
			.orderBy(asc(events.dateOfEvent))
			.limit(limit),
		orgs: db.select().from(organizations).orderBy(asc(organizations.name)).limit(limit)
	};
};
