import { EventRepo } from '$lib/repos/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) {
		return {
			attendingEvents: null,
			pastAttendedEvents: null,
			followedOrgsEvents: null
		};
	}

	const eventRepo = new EventRepo(platform);

	// Filter past events to only show those before today
	const now = new Date();

	return {
		attendingEvents: eventRepo.getUpcomingUserEvents(locals.user.id),
		pastAttendedEvents: eventRepo
			.getUserAttendedEvents(locals.user.id)
			.then((events) => events.filter((event) => new Date(event.dateOfEvent) < now)),
		followedOrgsEvents: eventRepo.getEventsFromUserFollowedOrgs(locals.user.id)
	};
};
