import { json } from '@sveltejs/kit';
import { seedDatabase } from '$lib/dev/seed';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
  // TODO: uncomment this
  // if (!import.meta.env.DEV) throw error(403, 'Forbidden in production');

  try {
    await seedDatabase(platform, {
      users: 10,
      sessions: 10,
      organizations: 10,
    });
  } catch (error) {
    return json({ status: 'failed', error });
  }

  return json({ status: 'seeded' });
};
