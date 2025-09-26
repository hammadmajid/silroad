import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { locals, platform, url } = event;
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	const db = getDb(platform);
	const userResult = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);
	const user = userResult[0];

	if (!user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Check for success messages from sub-pages
	const updated = url.searchParams.get('updated');
	let successMessage = null;
	if (updated === 'email') {
		successMessage = 'Email address updated successfully.';
	} else if (updated === 'password') {
		successMessage = 'Password updated successfully.';
	}

	return {
		user,
		successMessage
	};
};
