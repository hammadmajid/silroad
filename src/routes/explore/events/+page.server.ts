import { EventRepo } from '$lib/repos/events';

export const load = async ({ platform, url }) => {
	const eventRepo = new EventRepo(platform);

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = 6;

	const result = await eventRepo.getAll({ page, pageSize });

	return {
		events: result.data,
		pagination: result.pagination
	};
};
