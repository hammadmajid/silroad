import type { RequestEvent } from '@sveltejs/kit';

export function handleLoginRedirect(
	event: RequestEvent,
	message: string = 'You must be logged in to access this page'
) {
	const redirectTo = encodeURIComponent(event.url.pathname + event.url.search);
	const encodedMessage = encodeURIComponent(message);
	return `/login?redirectTo=${redirectTo}&msg=${encodedMessage}`;
}
