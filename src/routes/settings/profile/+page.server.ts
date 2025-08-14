import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { UserRepo } from '$lib/repos/user';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	// Server-side check for SEO and initial render
	// Client-side protection handled by useProtectedRoute hook
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Initialize form with current user data
	console.log('Load: ', locals.user.name);
	const form = await superValidate(
		{
			name: locals.user.name
		},
		zod4(schema)
	);

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!locals.user) {
			return fail(401, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const userRepo = new UserRepo(platform);
		const { name } = form.data;

		// Update user
		const updatedUser = await userRepo.update({
			id: locals.user.id,
			name,
			email: locals.user.email,
			image: locals.user.image
		});

		if (!updatedUser) {
			return message(form, 'Failed to update profile');
		}

		// Update locals.user with new data
		locals.user.name = updatedUser.name;
		console.log('Action: ', locals.user.name);

		return message(form, 'Profile updated successfully');
	}
};
