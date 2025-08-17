import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, SessionRepo } from '$lib/repos/session';
import { UserRepo } from '$lib/repos/user';
import { getPublicTurnstileKey, getSecretTurnstileKey, isProduction } from '$lib/utils/env';
import { Turnstile } from 'svelte-turnstile';

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
		throw redirect(303, '/explore');
	}

	return {
		isProd: isProduction(platform),
		publicTurnstileKey: getPublicTurnstileKey(platform),
		form: await superValidate(zod4(schema))
	};
};

export const actions = {
	default: async ({ request, platform, cookies, locals, url }) => {
		const form = await superValidate(request, zod4(schema));
		const sessionRepo = new SessionRepo(platform);
		const userRepo = new UserRepo(platform);

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const token = form.data['cf-turnstile-response'];
		const secret = getSecretTurnstileKey(platform);

		const { success } = await validateToken(token, secret);
		if (!success) {
			return message(form, 'Invalid captcha');
		}

		const user = await userRepo.verify(email, password);
		if (!user) {
			return message(form, 'Invalid email or password');
		}

		const session = await sessionRepo.create(user);
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

		// Check for redirectTo parameter and redirect accordingly
		const redirectTo = url.searchParams.get('redirectTo');
		const decodedRedirect = redirectTo ? decodeURIComponent(redirectTo) : null;
		const redirectUrl =
			decodedRedirect && isSafeRedirect(decodedRedirect) ? decodedRedirect : '/explore';

		throw redirect(303, redirectUrl);
	}
};
