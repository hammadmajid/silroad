import { type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, getSessionByToken, refreshSession } from '$lib/utils/session';

async function sessionRefresh(event: any, sessionToken: string, session: any) {
	return await refreshSession(event.platform, sessionToken, session);
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);

	const session = sessionToken ? await getSessionByToken(event.platform, sessionToken) : null;

	if (session && sessionToken) {
		event.locals.user = {
			id: session.userId,
			image: session.userImage
		};

		event.platform?.ctx.waitUntil(sessionRefresh(event, sessionToken, session));
	} else {
		// !redirection away from protected route must be handled at route level
		event.cookies.delete(SESSION_COOKIE_NAME, {
			path: '/'
		});
		event.locals.user = undefined;
	}

	return resolve(event);
};
