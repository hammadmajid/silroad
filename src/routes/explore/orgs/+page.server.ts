import { getDb } from '$lib/db';
import { organizations } from '$lib/db/schema';
import { asc, count } from 'drizzle-orm';

export const load = async ({ platform, url }) => {
	const db = getDb(platform);

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = 9;
	const offset = (page - 1) * pageSize;

	const countResult = await db.select({ count: count() }).from(organizations);
	const totalCount = countResult[0]?.count || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	const orgs = await db
		.select()
		.from(organizations)
		.orderBy(asc(organizations.name))
		.limit(pageSize)
		.offset(offset);

	return {
		orgs,
		pagination: {
			page,
			pageSize,
			totalCount,
			totalPages
		}
	};
};
