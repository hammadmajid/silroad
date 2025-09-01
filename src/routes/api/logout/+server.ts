import { SESSION_COOKIE_NAME } from '$lib/utils/session';
import { getKV } from '$lib/db';

export const POST = async ({ cookies, platform }) => {
	const token = cookies.get(SESSION_COOKIE_NAME);
	const kv = getKV(platform);

	if (token && platform) {
		platform.ctx.waitUntil(kv.delete(token));
	}

	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });

	return new Response(null, { status: 204 });
};
