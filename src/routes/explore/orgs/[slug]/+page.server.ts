import { OrganizationRepo } from '$lib/repos/orgs';
import { EventRepo } from '$lib/repos/events';
import { error, redirect } from '@sveltejs/kit';
import { Logger } from '$lib/utils/logger';
import type { PageServerLoad, Actions } from './$types';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	const orgRepo = new OrganizationRepo(platform);
	const eventRepo = new EventRepo(platform);
	const { slug } = params;

	// Get organization
	const organization = await orgRepo.getBySlug(slug);

	if (!organization) {
		throw error(404, 'Organization not found');
	}

	// Get organization events
	const organizationEvents = await eventRepo.getEventsByOrganization(organization.id);

	// Get members
	const members = await orgRepo.getMembers(organization.id);

	// Check if user is following this organization
	let isFollowing = false;
	if (locals.user) {
		const userFollowing = await orgRepo.getUserFollowing(locals.user.id);
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
		const orgRepo = new OrganizationRepo(platform);

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

			await orgRepo.toggleFollow(locals.user.id, organizationId);

			return { success: true };
		} catch (err) {
			logger.error('toggleFollow action', 'toggleFollow', err);
			throw err;
		}
	}
};
