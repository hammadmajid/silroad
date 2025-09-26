import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb, getKV } from '$lib/db';
import {
	users,
	sessions,
	attendees,
	organizationMembers,
	organizationFollowers,
	eventOrganizers
} from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { comparePassword } from '$lib/utils/crypto';
import { SESSION_COOKIE_NAME } from '$lib/utils/session';

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
	default: async ({ request, platform, locals, cookies }) => {
		const form = await superValidate(request, zod4(schema));

		if (!locals.user) {
			return fail(401, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const db = getDb(platform);
		const kv = getKV(platform);
		const { password } = form.data;

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

		// Verify password
		const validPassword = await comparePassword(password, user.salt, user.password);
		if (!validPassword) {
			return message(form, 'Password is incorrect.');
		}

		try {
			// Delete all related data first (cascading deletes)
			// Note: Some of these might cascade automatically due to foreign key constraints,
			// but we'll be explicit to ensure everything is cleaned up

			// Delete user's event attendances
			await db.delete(attendees).where(eq(attendees.userId, locals.user.id));

			// Delete user's organization memberships
			await db.delete(organizationMembers).where(eq(organizationMembers.userId, locals.user.id));

			// Delete user's organization follows
			await db
				.delete(organizationFollowers)
				.where(eq(organizationFollowers.userId, locals.user.id));

			// Delete user's event organizer roles
			await db.delete(eventOrganizers).where(eq(eventOrganizers.userId, locals.user.id));

			// Delete all user sessions from database
			await db.delete(sessions).where(eq(sessions.userId, locals.user.id));

			// Delete user sessions from KV store
			const userSessions = await db
				.select({ sessionToken: sessions.sessionToken })
				.from(sessions)
				.where(eq(sessions.userId, locals.user.id));

			for (const session of userSessions) {
				await kv.delete(session.sessionToken);
			}

			// Finally, delete the user
			await db.delete(users).where(eq(users.id, locals.user.id));

			// Clear the current session cookie
			cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

			// Clear locals.user
			locals.user = undefined;
		} catch (error) {
			console.error('Error deleting user account:', error);
			return message(form, 'Failed to delete account. Please try again.');
		}

		// Redirect to home page after successful deletion
		throw redirect(303, '/?deleted=account');
	}
};
