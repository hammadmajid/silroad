import { json } from '@sveltejs/kit';
import { seedDatabase } from '$lib/dev/seed';
import type { RequestHandler } from './$types';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export const POST: RequestHandler = async ({ platform, url }) => {
	// TODO: uncomment this
	// if (!import.meta.env.DEV) throw error(403, 'Forbidden in production');

	const n = 20;
	const logParam = url.searchParams.get('log') || 'error';
	const logLevel: LogLevel = ['error', 'warn', 'info', 'debug'].includes(logParam)
		? (logParam as LogLevel)
		: 'error';

	try {
		await seedDatabase(platform, n, logLevel);
	} catch (error) {
		return json({ status: 'failed', error });
	}

	return json({ status: 'seeded' });
};
