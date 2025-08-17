import { EventRepo } from '$lib/repos/events';
import { OrganizationRepo } from '$lib/repos/orgs';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const eventRepo = new EventRepo(platform);
	const orgRepo = new OrganizationRepo(platform);
	const { slug } = params;

	// Get event by slug
	const event = await eventRepo.getBySlug(slug);

	if (!event) {
		throw error(404, 'Event not found');
	}

	// Get organization details
	const organization = await orgRepo.getById(event.organizationId);

	// Get event with attendee count
	const eventWithCount = await eventRepo.getEventWithAttendeeCount(event.id);

	// Get organizers
	const organizers = await eventRepo.getOrganizers(event.id);

	return {
		event: {
			...event,
			organizationName: organization?.name || null,
			organizationSlug: organization?.slug || null,
			organizationAvatar: organization?.avatar || null
		},
		attendeeCount: eventWithCount?.attendeeCount || 0,
		organizers
	};
};
