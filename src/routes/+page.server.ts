import { getDb } from '$lib/db';
import { events, attendees, organizationFollowers } from '$lib/db/schema';
import { eq, gte, lt, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		return {
			attendingEvents: null,
			pastAttendedEvents: null,
			followedOrgsEvents: null
		};
	}

	// Filter past events to only show those before today
	const now = new Date();

	const db = getDb(platform);
	const userId = locals.user.id;
	return {
		attendingEvents: db
			.select({ events })
			.from(attendees)
			.innerJoin(events, eq(attendees.eventId, events.id))
			.where(and(eq(attendees.userId, userId), gte(events.dateOfEvent, now)))
			.then((rows) => rows.map((row) => row.events)),
		pastAttendedEvents: db
			.select({ events })
			.from(attendees)
			.innerJoin(events, eq(attendees.eventId, events.id))
			.where(and(eq(attendees.userId, userId), lt(events.dateOfEvent, now)))
			.then((rows) => rows.map((row) => row.events)),
		followedOrgsEvents: db
			.select({ events })
			.from(organizationFollowers)
			.innerJoin(events, eq(organizationFollowers.organizationId, events.organizationId))
			.where(and(eq(organizationFollowers.userId, userId), gte(events.dateOfEvent, now)))
			.then((rows) => rows.map((row) => row.events))
	};
};
