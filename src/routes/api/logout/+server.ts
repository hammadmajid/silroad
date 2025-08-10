import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME } from '$lib/repos/session';

export const POST = async ({ cookies }) => {
  // TODO: delete session from DB and KV

  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

  return new Response();
};
