import { json } from '@sveltejs/kit';
import { seedDatabase } from '$lib/dev/seed';
import type { RequestHandler } from './$types';

interface SeedOptions {
	numOrgs?: number;
	numUsers?: number;
	numEventsPerOrg?: number;
	numSessions?: number;
}

export const POST: RequestHandler = async ({ platform, request }) => {
	// TODO: uncomment this
	// if (!import.meta.env.DEV) throw error(403, 'Forbidden in production');

	try {
		const body = (await request.json().catch(() => ({}))) as Record<string, any>;
		const options: SeedOptions = {
			numOrgs: body.numOrgs,
			numUsers: body.numUsers,
			numEventsPerOrg: body.numEventsPerOrg,
			numSessions: body.numSessions
		};
		await seedDatabase(platform, options);
	} catch (error) {
		return json({ status: 'failed', error });
	}

	return json({ status: 'seeded' });
};
