import { userStore } from '$lib/stores/user.svelte.js';
import { goto } from '$app/navigation';
import { onMount } from 'svelte';

/**
 * Hook to protect pages that require authentication
 * Redirects to login if user is not authenticated
 */
export function useProtectedRoute(redirectTo = '/login') {
    // TODO: redirect back to requested page after successfull login

	onMount(() => {
		if (!userStore.isLoggedIn) {
			goto(redirectTo);
		}
	});

	return userStore;
}
