import type { RequestEvent } from '@sveltejs/kit';

export function handleLoginRedirect(
	event: RequestEvent,
	message: string = 'You must be logged in to access this page'
) {
	// Filter out SvelteKit action parameters (starting with /) from search params
	const url = new URL(event.url);
	const filteredSearchParams = new URLSearchParams();

	for (const [key, value] of url.searchParams) {
		if (!key.startsWith('/')) {
			filteredSearchParams.set(key, value);
		}
	}

	const search = filteredSearchParams.toString();
	const redirectTo = encodeURIComponent(event.url.pathname + (search ? `?${search}` : ''));
	const encodedMessage = encodeURIComponent(message);
	return `/login?redirectTo=${redirectTo}&msg=${encodedMessage}`;
}
