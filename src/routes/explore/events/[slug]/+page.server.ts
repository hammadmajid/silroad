import { EventRepo } from '$lib/repos/events';
import { OrganizationRepo } from '$lib/repos/orgs';
import { error, redirect } from '@sveltejs/kit';
import { Logger } from '$lib/utils/logger';
import type { PageServerLoad, Actions, RequestEvent } from './$types';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
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

	// Check if user is attending this event
	let isAttending = false;
	if (locals.user) {
		isAttending = await eventRepo.isAttending(event.id, locals.user.id);
	}

	return {
		event: {
			...event,
			organizationName: organization?.name || null,
			organizationSlug: organization?.slug || null,
			organizationAvatar: organization?.avatar || null
		},
		attendeeCount: eventWithCount?.attendeeCount || 0,
		organizers,
		isAttending
	};
};

export const actions: Actions = {
	toggleAttendance: async (event: RequestEvent) => {
		const { request, platform, locals } = event;
		const logger = new Logger(platform);
		const eventRepo = new EventRepo(platform);

		if (!locals.user) {
			throw redirect(303, handleLoginRedirect(event, 'You must be logged in to RSVP to events'));
		}

		try {
			const formData = await request.formData();
			const eventId = formData.get('eventId') as string;

			if (!eventId || !locals.user) {
				throw error(400, 'Invalid ID');
			}

			const result = await eventRepo.toggleAttendance(locals.user.id, eventId);

			if (result === null) {
				logger.error('toggleAttendance action', 'toggleAttendance', 'Failed to toggle attendance');
				throw error(500, 'Unable to update attendance status');
			}

			return { success: true };
		} catch (err) {
			logger.error('toggleAttendance action', 'toggleAttendance', err);
			throw err;
		}
	}
};
