import { getDb } from '$lib/db';
import { events } from '$lib/db/schema';
import { count, desc } from 'drizzle-orm';

export const load = async ({ platform, url }) => {
	const db = getDb(platform);

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = 9;
	const offset = (page - 1) * pageSize;

	// Get total count
	const totalCountResult = await db.select({ count: count() }).from(events);
	const totalCount = totalCountResult[0]?.count ?? 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	// Get paginated events
	const eventsData = await db
		.select()
		.from(events)
		.orderBy(desc(events.dateOfEvent))
		.limit(pageSize)
		.offset(offset);

	return {
		events: eventsData,
		pagination: {
			page,
			pageSize,
			totalCount,
			totalPages
		}
	};
};
