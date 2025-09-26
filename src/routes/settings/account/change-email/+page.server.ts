import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { locals, platform } = event;
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	const db = getDb(platform);
	const userResult = await db
		.select({
			id: users.id,
			email: users.email
		})
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);
	const user = userResult[0];

	if (!user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	const form = await superValidate(zod4(schema));

	return {
		form,
		currentEmail: user.email
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

		const db = getDb(platform);
		const { email } = form.data;

		// Check if email is already in use
		const existingUserResult = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUserResult.length > 0 && existingUserResult[0].id !== locals.user.id) {
			return message(form, 'Email address is already in use.');
		}

		// Update user email
		const [updatedUser] = await db
			.update(users)
			.set({ email })
			.where(eq(users.id, locals.user.id))
			.returning({
				id: users.id,
				email: users.email
			});

		if (!updatedUser) {
			return message(form, 'Failed to update email address.');
		}

		throw redirect(303, '/settings/account?updated=email');
	}
};
