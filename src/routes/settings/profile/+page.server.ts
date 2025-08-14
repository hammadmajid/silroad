import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { UserRepo } from '$lib/repos/user';
import { SESSION_COOKIE_NAME } from '$lib/repos/session';

export const load: PageServerLoad = async (event) => {
	const { locals, platform } = event;
	// Server-side check for SEO and initial render
	// Client-side protection handled by useProtectedRoute hook
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	const userRepo = new UserRepo(platform);
	const user = await userRepo.getById(locals.user.id);

	if (!user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Initialize form with current user data
	const form = await superValidate(
		{
			name: user.name
		},
		zod4(schema)
	);

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request, platform, locals, cookies }) => {
		const form = await superValidate(request, zod4(schema));

		if (!locals.user) {
			return fail(401, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const userRepo = new UserRepo(platform);
		const { name } = form.data;

		// Get current user data
		const currentUser = await userRepo.getById(locals.user.id);
		if (!currentUser) {
			return message(form, 'User not found');
		}

		// Get session token
		const sessionToken = cookies.get(SESSION_COOKIE_NAME);
		if (!sessionToken) {
			return message(form, 'Failed to update profile');
		}

		// Update user
		const updatedUser = await userRepo.update({
			id: locals.user.id,
			name,
			email: currentUser.email,
			image: currentUser.image
		});

		if (!updatedUser) {
			return message(form, 'Failed to update profile');
		}

		return message(form, 'Profile updated successfully');
	}
};
