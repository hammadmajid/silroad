import { type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE_NAME, SessionRepo } from '$lib/repos/session';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE_NAME);
	const repo = new SessionRepo(event.platform);

	const session = sessionToken ? await repo.getByToken(sessionToken) : null;

	if (session && sessionToken) {
		event.locals.user = {
			id: session.userId,
			image: session.userImage
		};

		repo.refresh(sessionToken, session);
	} else {
		// !redirection away from protected route must be handled at route level
		event.cookies.delete(SESSION_COOKIE_NAME, {
			path: '/'
		});
		event.locals.user = undefined;
	}

	return resolve(event);
};
