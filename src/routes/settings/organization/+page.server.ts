import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDb } from '$lib/db';
import { users, organizations, organizationMembers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleLoginRedirect } from '$lib/utils/redirect';
import { canCreateOrganization } from '$lib/utils/plans';

export const load: PageServerLoad = async (event) => {
	const { platform, locals } = event;
	const db = getDb(platform);

	// Get user from locals (set by hooks.server.ts)
	const localUser = locals.user;

	if (!localUser) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Get user with plan information
	const userWithPlan = await db
		.select({
			plan: users.plan
		})
		.from(users)
		.where(eq(users.id, localUser.id))
		.limit(1);

	const userPlan = userWithPlan[0]?.plan || 'free';

	// Get organizations where user is a member
	const userOrganizations = await db
		.select({
			id: organizations.id,
			name: organizations.name,
			slug: organizations.slug,
			description: organizations.description,
			avatar: organizations.avatar,
			backgroundImage: organizations.backgroundImage,
			createdAt: organizations.createdAt
		})
		.from(organizationMembers)
		.innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
		.where(eq(organizationMembers.userId, localUser.id));

	// Get organization owned by the user (where user.organizationId matches)
	const ownedOrganizationResult = await db
		.select({
			id: organizations.id,
			name: organizations.name,
			slug: organizations.slug,
			description: organizations.description,
			avatar: organizations.avatar,
			backgroundImage: organizations.backgroundImage,
			createdAt: organizations.createdAt
		})
		.from(users)
		.innerJoin(organizations, eq(users.organizationId, organizations.id))
		.where(eq(users.id, localUser.id))
		.limit(1);
	const ownedOrganization = ownedOrganizationResult[0] || null;

	return {
		userOrganizations,
		ownedOrganization,
		userPlan,
		canCreateOrganization: canCreateOrganization(userPlan)
	};
};
