import { getDb } from '$lib/db';
import { organizations } from '$lib/db/schema';
import { count } from 'drizzle-orm';

export const load = async ({ platform, url }) => {
	const db = getDb(platform);

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = 10;
	const offset = (page - 1) * pageSize;

	// Get total count and paginated organizations
	const [totalCountResult, orgsResult] = await Promise.all([
		db.select({ count: count() }).from(organizations),
		db.select().from(organizations).limit(pageSize).offset(offset)
	]);

	const totalCount = totalCountResult[0].count;
	const totalPages = Math.ceil(totalCount / pageSize);

	return {
		orgs: orgsResult,
		pagination: {
			page,
			pageSize,
			totalCount,
			totalPages
		}
	};
};
