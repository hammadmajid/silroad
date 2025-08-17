import { EventRepo } from '$lib/repos/events';
import { OrganizationRepo } from '$lib/repos/orgs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	const eventRepo = new EventRepo(platform);
	const orgRepo = new OrganizationRepo(platform);

	// Return promises instead of awaited results to allow component-level loading states
	return {
		events: eventRepo.getUpcomingEvents(5),
		orgs: orgRepo.getAll({ page: 1, pageSize: 5 }).then((result) => result.data)
	};
};
