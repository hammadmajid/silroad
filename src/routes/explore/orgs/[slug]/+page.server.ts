import { OrganizationRepo } from '$lib/repos/orgs';
import { EventRepo } from '$lib/repos/events';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
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

	return {
		organization,
		events: organizationEvents,
		memberCount: members.length,
		members: members.slice(0, 6) // Only show first 6 members for display
	};
};
