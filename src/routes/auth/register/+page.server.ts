import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db';
import { sessions, users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSalt, hashPassword } from '$lib/utils/crypto';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/explore');
	}

	return {
		form: await superValidate(zod4(schema))
	};
};

export const actions = {
	default: async ({ request, platform, cookies, locals }) => {
		const form = await superValidate(request, zod4(schema));
		const db = getDb(platform);
		const kv = platform?.env.KV;

		if (!form.valid) {
			return fail(400, { form });
		}

		const { firstName, lastName, email, password } = form.data;

		// hash password here to prevent timing attack
		const salt = generateSalt();
		const hashedPassword = await hashPassword(password, salt);

		const exists = await db.select().from(users).where(eq(users.email, email));

		if (exists.length > 0) {
			return message(form, 'Failed to create user');
		}

		const [user] = await db
			.insert(users)
			.values({
				name: `${firstName} ${lastName}`,
				email: email,
				password: hashedPassword,
				hash: salt
			})
			.returning();

		const [session] = await db
			.insert(sessions)
			.values({
				userId: user.id,
				expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in ms
				sessionToken: generateSalt()
			})
			.returning();

		await kv?.put(session.sessionToken, JSON.stringify({
			userId: user.id,
			userEmail: user.email,
			userName: user.name,
			userImage: user.image,
			sessionExpires: session.sessionToken,
		}));

		cookies.set('session_token', session.sessionToken, {
			path: '/',
			expires: session.expires,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 14 * 24 * 60 * 60 // 14 days in seconds
		});

		locals.user = user;

		throw redirect(302, '/settings/profile');
	}
};
