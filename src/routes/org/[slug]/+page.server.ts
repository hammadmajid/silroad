import { getDb } from '$lib/db';
import { organizations, events, users, organizationMembers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const { slug } = params;

	// Get organization
	const [organization] = await db.select().from(organizations).where(eq(organizations.slug, slug));

	if (!organization) {
		throw error(404, 'Organization not found');
	}

	// Get organization events
	const organizationEvents = await db
		.select()
		.from(events)
		.where(eq(events.organizationId, organization.id))
		.orderBy(events.dateOfEvent);

	// Get member count
	const memberCount = await db
		.select({ count: organizationMembers.userId })
		.from(organizationMembers)
		.where(eq(organizationMembers.organizationId, organization.id));

	// Get some members (for display)
	const members = await db
		.select({
			userId: users.id,
			name: users.name,
			image: users.image
		})
		.from(organizationMembers)
		.leftJoin(users, eq(organizationMembers.userId, users.id))
		.where(eq(organizationMembers.organizationId, organization.id))
		.limit(6);

	return {
		organization,
		events: organizationEvents,
		memberCount: memberCount.length,
		members
	};
};
