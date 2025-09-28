import type { PageServerLoad } from './$types';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect } from '@sveltejs/kit';
import { getDb, getKV } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSalt, hashPassword } from '$lib/utils/crypto';

export const load: PageServerLoad = async ({ url, platform }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(303, '/login?msg=' + encodeURIComponent('Invalid reset link.'));
	}

	const kv = getKV(platform);
	const resetData = await kv.get(`password_reset:${token}`);

	if (!resetData) {
		throw redirect(
			303,
			'/login?msg=' + encodeURIComponent('Reset link has expired or is invalid.')
		);
	}

	const parsedData = JSON.parse(resetData);
	if (Date.now() > parsedData.expires) {
		await kv.delete(`password_reset:${token}`);
		throw redirect(303, '/login?msg=' + encodeURIComponent('Reset link has expired.'));
	}

	return {
		form: await superValidate(zod4(schema)),
		email: parsedData.email,
		token
	};
};

export const actions = {
	default: async ({ request, platform, url }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const token = url.searchParams.get('token');
		if (!token) {
			return message(form, 'Invalid reset link.');
		}

		const kv = getKV(platform);
		const resetData = await kv.get(`password_reset:${token}`);

		if (!resetData) {
			return message(form, 'Reset link has expired or is invalid.');
		}

		const parsedData = JSON.parse(resetData);
		if (Date.now() > parsedData.expires) {
			await kv.delete(`password_reset:${token}`);
			return message(form, 'Reset link has expired.');
		}

		const { password } = form.data;
		const { email } = parsedData;

		const db = getDb(platform);
		const salt = generateSalt();
		const hashedPassword = await hashPassword(password, salt);

		await db
			.update(users)
			.set({
				password: hashedPassword,
				salt: salt
			})
			.where(eq(users.email, email));

		await kv.delete(`password_reset:${token}`);

		throw redirect(
			303,
			'/login?msg=' +
				encodeURIComponent('Password reset successfully. Please login with your new password.')
		);
	}
};
