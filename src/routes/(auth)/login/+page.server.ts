import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/utils/session';
import { getDb } from '$lib/db';
import { users } from '$lib/db/schema';
import { comparePassword } from '$lib/utils/crypto';
import { eq } from 'drizzle-orm';
import { generateSessionToken } from '$lib/utils/crypto';
import { getKV } from '$lib/db';
import { sessions } from '$lib/db/schema';
import { isProduction } from '$lib/utils/env';
import { getInbound } from '$lib/utils/inbound';

function isSafeRedirect(url: string): boolean {
	if (!url) return false;

	// Only allow relative URLs that start with /
	if (!url.startsWith('/')) return false;

	// Prevent protocol-relative URLs (//example.com)
	if (url.startsWith('//')) return false;

	// Prevent data URLs and javascript URLs
	if (url.includes(':')) return false;

	return true;
}

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
	default: async ({ request, platform, cookies, locals, url }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const db = getDb(platform);
		const userResult = await db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				image: users.image,
				password: users.password,
				salt: users.salt
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		const userRow = userResult[0];
		if (!userRow) {
			return message(form, 'Invalid email or password');
		}
		const validPass = await comparePassword(password, userRow.salt, userRow.password);
		if (!validPass) {
			return message(form, 'Invalid email or password');
		}
		const user = {
			id: userRow.id,
			email: userRow.email,
			name: userRow.name,
			image: userRow.image
		};

		// Direct session creation
		const token = generateSessionToken();
		const expires = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days
		await db.insert(sessions).values({
			sessionToken: token,
			userId: user.id,
			expires: new Date(expires)
		});
		const kv = getKV(platform);
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

		// send email in background
		const inbound = getInbound(platform);
		platform?.ctx.waitUntil(
			inbound.emails.send({
				from: 'Silroad <no-reply@silroad.space>',
				to: user.email,
				subject: 'Silroad Login Alert',
				html: '<p>You recently logged into your silroad account.</p>'
			})
		);

		// Check for redirectTo parameter and redirect accordingly
		const redirectTo = url.searchParams.get('redirectTo');
		const decodedRedirect = redirectTo ? decodeURIComponent(redirectTo) : null;
		const redirectUrl = decodedRedirect && isSafeRedirect(decodedRedirect) ? decodedRedirect : '/';

		throw redirect(303, redirectUrl);
	}
};
