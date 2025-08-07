import { json } from '@sveltejs/kit';
import { seedDatabase } from '$lib/dev/seed';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
  // TODO: uncomment this
  // if (!import.meta.env.DEV) throw error(403, 'Forbidden in production');

  const n = 20;

  try {
    await seedDatabase(platform, n);
  } catch (error) {
    return json({ status: 'failed', error });
  }

  return json({ status: 'seeded' });
};
