import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, SessionRepo } from '$lib/repos/session';
import { UserRepo } from '$lib/repos/user';

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
		const sessionRepo = new SessionRepo(platform);
		const userRepo = new UserRepo(platform);

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;

		const user = await userRepo.verify(email, password);
		if (!user) {
			return message(form, 'Invalid email or password');
		}

		const session = await sessionRepo.create(user);
		if (!session) {
			console.error('/login: failed to create session');
			return message(form, 'Failed to create session');
		}

		cookies.set(SESSION_COOKIE_NAME, session.token, {
			path: '/',
			expires: session.expiresAt,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: Math.max((session.expiresAt.getTime() - Date.now()) / 1000)
		});

		locals.user = user;

		throw redirect(302, '/explore');
	}
};
