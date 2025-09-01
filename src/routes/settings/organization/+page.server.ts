import { OrganizationRepo } from '$lib/repos/orgs';
import { UserRepo } from '$lib/repos/user';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, locals }) => {
    const orgRepo = new OrganizationRepo(platform);

    // Get user from locals (set by hooks.server.ts)
    const localUser = locals.user;

    if (!localUser) {
        throw redirect(303, '/login')
    }

    // Get organizations where user is a member
    const userOrganizations = await orgRepo.getUserOrganizations(localUser.id);

    // Get organization owned by the user (where user.organizationId matches)
    const ownedOrganization = await orgRepo.getUserOwnedOrganization(localUser.id);

    return {
        userOrganizations,
        ownedOrganization,
    };
};
