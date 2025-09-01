import { getDb } from '$lib/db';
import { events, organizations, attendees, eventOrganizers, users } from '$lib/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { error, redirect } from '@sveltejs/kit';
import { Logger } from '$lib/utils/logger';
import type { PageServerLoad, Actions, RequestEvent } from './$types';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	const db = getDb(platform);
	const { slug } = params;

	// Get event by slug
	const eventResult = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
	const event = eventResult[0];

	if (!event) {
		throw error(404, 'Event not found');
	}

	// Get organization details
	const organizationResult = await db
		.select()
		.from(organizations)
		.where(eq(organizations.id, event.organizationId))
		.limit(1);
	const organization = organizationResult[0];

	// Get event with attendee count
	const eventWithCountResult = await db
		.select({
			id: events.id,
			title: events.title,
			slug: events.slug,
			description: events.description,
			dateOfEvent: events.dateOfEvent,
			closeRsvpAt: events.closeRsvpAt,
			maxAttendees: events.maxAttendees,
			image: events.image,
			organizationId: events.organizationId,
			attendeeCount: count(attendees.userId)
		})
		.from(events)
		.leftJoin(attendees, eq(events.id, attendees.eventId))
		.where(eq(events.id, event.id))
		.groupBy(events.id);
	const eventWithCount = eventWithCountResult[0];

	// Get organizers
	const organizers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			image: users.image
		})
		.from(eventOrganizers)
		.innerJoin(users, eq(eventOrganizers.userId, users.id))
		.where(eq(eventOrganizers.eventId, event.id))
		.orderBy(users.name);

	// Check if user is attending this event
	let isAttending = false;
	if (locals.user) {
		const attendingResult = await db
			.select({ userId: attendees.userId })
			.from(attendees)
			.where(and(eq(attendees.eventId, event.id), eq(attendees.userId, locals.user.id)))
			.limit(1);
		isAttending = attendingResult.length > 0;
	}

	// Determine if user can RSVP
	const now = new Date();
	const isRsvpOpen = event.closeRsvpAt ? now < event.closeRsvpAt : true;
	const isEventFull = event.maxAttendees
		? (eventWithCount?.attendeeCount || 0) >= event.maxAttendees
		: false;

	return {
		event: {
			...event,
			organizationName: organization?.name || null,
			organizationSlug: organization?.slug || null,
			organizationAvatar: organization?.avatar || null
		},
		attendeeCount: eventWithCount?.attendeeCount || 0,
		organizers,
		isAttending,
		isRsvpOpen,
		isEventFull
	};
};

export const actions: Actions = {
	toggleAttendance: async (event: RequestEvent) => {
		const { request, platform, locals } = event;
		const logger = new Logger(platform);
		const db = getDb(platform);

		if (!locals.user) {
			throw redirect(303, handleLoginRedirect(event, 'You must be logged in to RSVP to events'));
		}

		try {
			const formData = await request.formData();
			const eventId = formData.get('eventId') as string;

			if (!eventId) {
				throw error(400, 'Invalid event ID');
			}

			// Toggle attendance logic - try removing first
			const deleted = await db
				.delete(attendees)
				.where(and(eq(attendees.eventId, eventId), eq(attendees.userId, locals.user.id)))
				.returning({ id: attendees.eventId });

			if (deleted.length === 0) {
				// User was not attending, add them
				await db.insert(attendees).values({ eventId, userId: locals.user.id });
			}

			return { success: true };
		} catch (err) {
			logger.error('toggleAttendance action', 'toggleAttendance', err);
			throw err;
		}
	}
};
