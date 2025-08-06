import { json, error } from '@sveltejs/kit';
import { seedDatabase } from '$lib/dev/seed';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
  // TODO: uncomment this
  // if (!import.meta.env.DEV) throw error(403, 'Forbidden in production');

  const body = await request.json().catch(() => null);
  if (!body || typeof body.users !== 'number' || typeof body.sessions !== 'number') {
    throw error(400, 'Invalid request body: expected { users: number, sessions: number }');
  }

  await seedDatabase(platform, {
    users: body.users,
    sessions: body.sessions
  });

  return json({ status: 'seeded', users: body.users, sessions: body.sessions });
};
