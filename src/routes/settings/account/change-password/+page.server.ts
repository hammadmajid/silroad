import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword, generateSalt, hashPassword } from '$lib/utils/crypto';

export const load: PageServerLoad = async (event) => {
	const { locals } = event;
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	const form = await superValidate(zod4(schema));

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

		const db = getDb(platform);
		const { currentPassword, newPassword } = form.data;

		// Get current user data to verify password
		const userResult = await db
			.select({
				id: users.id,
				password: users.password,
				salt: users.salt
			})
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);
		const user = userResult[0];

		if (!user) {
			return message(form, 'User not found.');
		}

		// Verify current password
		const validPassword = await comparePassword(currentPassword, user.salt, user.password);
		if (!validPassword) {
			return message(form, 'Current password is incorrect.');
		}

		// Generate new salt and hash new password
		const newSalt = generateSalt();
		const newHashedPassword = await hashPassword(newPassword, newSalt);

		// Update user password
		const [updatedUser] = await db
			.update(users)
			.set({
				password: newHashedPassword,
				salt: newSalt
			})
			.where(eq(users.id, locals.user.id))
			.returning({ id: users.id });

		if (!updatedUser) {
			return message(form, 'Failed to update password.');
		}

		throw redirect(303, '/settings/account?updated=password');
	}
};
