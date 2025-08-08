import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, SessionRepo } from '$lib/repos/session';
import { UserRepo } from '$lib/repos/user';
import { generateSalt, hashPassword } from '$lib/utils/crypto';
import { isProduction } from '$lib/utils/env';

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (locals.user) {
		throw redirect(303, '/explore');
	}

	return {
		isProd: isProduction(platform),
		form: await superValidate(zod4(schema))
	};
};

export const actions = {
	default: async ({ request, platform, cookies, locals }) => {
		const form = await superValidate(request, zod4(schema));
		const sessionRepo = new SessionRepo(platform);
		const userRepo = new UserRepo(platform);

		if (!form.valid) {
			return fail(400, { form });
		}

		const { firstName, lastName, email, password } = form.data;

		// hash password here to prevent timing attack
		const salt = generateSalt();
		const hashedPaswword = await hashPassword(password, salt);

		const exists = await userRepo.getByEmail(email);
		if (exists) {
			return message(form, 'Failed to create user');
		}

		const user = await userRepo.create(email, `${firstName} ${lastName}`, hashedPaswword, salt);
		if (!user) {
			return message(form, 'Failed to create user');
		}

		const session = await sessionRepo.create(user);
		if (!session) {
			// TODO: handle this properly
			console.error('/register: failed to create session');
			throw redirect(302, '/login');
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

		// TODO: send the email verification code; then
		// throw redirect(302, "/register/verify-email")

		throw redirect(302, '/explore');
	}
};
