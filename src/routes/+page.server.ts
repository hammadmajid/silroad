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
			.select()
			.from(attendees)
			.innerJoin(events, eq(attendees.eventId, events.id))
			.where(and(eq(attendees.userId, userId), gte(events.dateOfEvent, now))),
		pastAttendedEvents: db
			.select()
			.from(attendees)
			.innerJoin(events, eq(attendees.eventId, events.id))
			.where(and(eq(attendees.userId, userId), lt(events.dateOfEvent, now))),
		followedOrgsEvents: db
			.select()
			.from(organizationFollowers)
			.innerJoin(events, eq(organizationFollowers.organizationId, events.organizationId))
			.where(and(eq(organizationFollowers.userId, userId), gte(events.dateOfEvent, now)))
	};
};
