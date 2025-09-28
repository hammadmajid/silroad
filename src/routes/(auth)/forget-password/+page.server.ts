import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { getDb, getKV } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSessionToken } from '$lib/utils/crypto';
import { sendEmail, createPasswordResetEmail } from '$lib/utils/email';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/');
	}

	return {
		form: await superValidate(zod4(schema))
	};
};

export const actions = {
	default: async ({ request, platform }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email } = form.data;

		const db = getDb(platform);
		const kv = getKV(platform);

		const userResult = await db
			.select({ id: users.id, email: users.email })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (userResult.length === 0) {
			return message(form, 'If an account with that email exists, a reset link has been sent.');
		}

		const resetToken = generateSessionToken();
		const resetData = {
			email: email,
			expires: Date.now() + 15 * 60 * 1000
		};

		await kv.put(`password_reset:${resetToken}`, JSON.stringify(resetData), {
			expirationTtl: 15 * 60
		});

		const resetEmail = createPasswordResetEmail(email, resetToken);
		sendEmail(
			{ platform, request },
			{
				to: email,
				...resetEmail
			}
		);

		return message(form, 'If an account with that email exists, a reset link has been sent.');
	}
};
