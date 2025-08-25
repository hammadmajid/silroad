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
		const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
		const options: SeedOptions = {
			numOrgs: typeof body.numOrgs === 'number' ? body.numOrgs : undefined,
			numUsers: typeof body.numUsers === 'number' ? body.numUsers : undefined,
			numEventsPerOrg: typeof body.numEventsPerOrg === 'number' ? body.numEventsPerOrg : undefined,
			numSessions: typeof body.numSessions === 'number' ? body.numSessions : undefined
		};
		await seedDatabase(platform, options);
	} catch (error) {
		return json({ status: 'failed', error });
	}

	return json({ status: 'seeded' });
};
