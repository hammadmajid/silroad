import { getDb } from '$lib/db';
import { organizations, organizationMembers, organizationFollowers, users } from '$lib/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { events } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { Logger } from '$lib/utils/logger';
import type { PageServerLoad, Actions } from './$types';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	const db = getDb(platform);
	const { slug } = params;

	// Get organization
	const orgResult = await db
		.select()
		.from(organizations)
		.where(eq(organizations.slug, slug))
		.limit(1);
	const organization = orgResult[0];

	if (!organization) {
		throw error(404, 'Organization not found');
	}

	// Get organization events
	const organizationEvents = await db
		.select()
		.from(events)
		.where(eq(events.organizationId, organization.id))
		.orderBy(asc(events.dateOfEvent));

	// Get members
	const members = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			image: users.image
		})
		.from(organizationMembers)
		.innerJoin(users, eq(organizationMembers.userId, users.id))
		.where(eq(organizationMembers.organizationId, organization.id))
		.orderBy(asc(users.name));

	// Check if user is following this organization
	let isFollowing = false;
	if (locals.user) {
		const userFollowing = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				slug: organizations.slug,
				avatar: organizations.avatar,
				description: organizations.description,
				backgroundImage: organizations.backgroundImage
			})
			.from(organizationFollowers)
			.leftJoin(organizations, eq(organizations.id, organizationFollowers.organizationId))
			.where(eq(organizationFollowers.userId, locals.user.id));
		isFollowing = userFollowing.some((org) => org.id === organization.id);
	}

	return {
		organization,
		events: organizationEvents,
		memberCount: members.length,
		members: members.slice(0, 6), // Only show first 6 members for display
		isFollowing
	};
};

export const actions: Actions = {
	toggleFollow: async (event) => {
		const { request, platform, locals } = event;
		const logger = new Logger(platform);

		if (!locals.user) {
			throw redirect(
				303,
				handleLoginRedirect(event, 'You must be logged in to follow organizations')
			);
		}

		try {
			const formData = await request.formData();
			const organizationId = formData.get('organizationId') as string;

			if (!organizationId || !locals.user) {
				throw error(400, 'Invalid ID');
			}

			// Toggle follow logic
			const db = getDb(platform);
			const deleted = await db
				.delete(organizationFollowers)
				.where(
					and(
						eq(organizationFollowers.userId, locals.user.id),
						eq(organizationFollowers.organizationId, organizationId)
					)
				)
				.returning({ id: organizationFollowers.organizationId });
			if (deleted.length === 0) {
				await db.insert(organizationFollowers).values({ userId: locals.user.id, organizationId });
			}

			return { success: true };
		} catch (err) {
			logger.error('toggleFollow action', 'toggleFollow', err);
			throw err;
		}
	}
};
