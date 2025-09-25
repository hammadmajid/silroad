import { json } from '@sveltejs/kit';
import { cleanupDatabase } from '$lib/dev/seed';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ platform }) => {
	// TODO: Only allow in development
	// if (!import.meta.env.DEV) {
	// 	return json({ status: 'forbidden', error: 'Forbidden in production' }, { status: 403 });
	// }

	try {
		await cleanupDatabase(platform);
	} catch (error) {
		return json({ status: 'failed', error });
	}

	return json({ status: 'cleaned' });
};
