import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/utils/session';
import { getDb, getKV } from '$lib/db';
import { users, sessions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSessionToken } from '$lib/utils/crypto';
import { generateSalt, hashPassword } from '$lib/utils/crypto';
import { isProduction } from '$lib/utils/env';
import { sendEmail, createWelcomeEmail } from '$lib/utils/email';

export const load: PageServerLoad = async ({ locals, platform }) => {
	// Note: We still check locals.user for server-side redirect
	// The client will handle the user store initialization
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {
		isProd: isProduction(platform),
		form: await superValidate(zod4(schema))
	};
};

export const actions = {
	default: async ({ request, platform, cookies, locals }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { firstName, lastName, email, password } = form.data;

		// Always hash password to prevent timing attack
		const salt = generateSalt();
		const hashedPassword = await hashPassword(password, salt);

		const db = getDb(platform);
		const kv = getKV(platform);
		const existsResult = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (existsResult.length > 0) {
			return message(form, 'Failed to create user');
		}

		const [userRow] = await db
			.insert(users)
			.values({
				email,
				name: `${firstName} ${lastName}`,
				password: hashedPassword,
				salt,
				image: null
			})
			.returning();
		if (!userRow) {
			return message(form, 'Failed to create user');
		}
		const user = {
			id: userRow.id,
			email,
			name: `${firstName} ${lastName}`,
			image: null
		};

		const token = generateSessionToken();
		const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
		await db.insert(sessions).values({
			sessionToken: token,
			userId: user.id,
			expires: new Date(expires)
		});
		const sessionData = {
			userId: user.id,
			userImage: user.image,
			sessionExpiresAt: new Date(expires).toISOString()
		};
		await kv.put(token, JSON.stringify(sessionData));
		const session = { token, expiresAt: new Date(expires) };
		if (!session) {
			return message(form, 'Failed to create session');
		}

		cookies.set(SESSION_COOKIE_NAME, session.token, {
			path: '/',
			expires: session.expiresAt,
			httpOnly: true,
			secure: isProduction(platform),
			sameSite: 'strict',
			maxAge: Math.max((session.expiresAt.getTime() - Date.now()) / 1000)
		});

		locals.user = user;

		// send welcome email in background
		const welcomeEmail = createWelcomeEmail(user);
		sendEmail({ platform, request, user }, { to: user.email, ...welcomeEmail });

		// TODO: send the email verification code; then
		// throw redirect(302, "/register/verify-email")

		throw redirect(303, '/');
	}
};
