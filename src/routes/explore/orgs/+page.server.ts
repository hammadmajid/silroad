import { OrganizationRepo } from '$lib/repos/orgs';

export const load = async ({ platform, url }) => {
	const orgRepo = new OrganizationRepo(platform);

	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = 9;

	const result = await orgRepo.getAll({ page, pageSize });

	return {
		orgs: result.data,
		pagination: result.pagination
	};
};
