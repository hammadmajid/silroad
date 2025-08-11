import { getDb } from '$lib/db';
import { events, organizations, users, attendees, eventOrganizers } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, platform }) => {
	const db = getDb(platform);
	const { id } = params;

	// Get event with organization and attendee count
	const [event] = await db
		.select({
			id: events.id,
			title: events.title,
			description: events.description,
			dateOfEvent: events.dateOfEvent,
			closeRsvpAt: events.closeRsvpAt,
			maxAttendees: events.maxAttendees,
			image: events.image,
			organizationId: events.organizationId,
			organizationName: organizations.name,
			organizationSlug: organizations.slug,
			organizationAvatar: organizations.avatar
		})
		.from(events)
		.leftJoin(organizations, eq(events.organizationId, organizations.id))
		.where(eq(events.id, id));

	if (!event) {
		throw error(404, 'Event not found');
	}

	// Get attendee count
	const attendeeCount = await db
		.select({ count: attendees.userId })
		.from(attendees)
		.where(eq(attendees.eventId, id));

	// Get organizers
	const eventOrganizersList = await db
		.select({
			userId: users.id,
			name: users.name,
			image: users.image
		})
		.from(eventOrganizers)
		.leftJoin(users, eq(eventOrganizers.userId, users.id))
		.where(eq(eventOrganizers.eventId, id));

	return {
		event,
		attendeeCount: attendeeCount.length,
		organizers: eventOrganizersList
	};
};
