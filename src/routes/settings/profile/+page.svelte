<script lang="ts">
	import { goto } from '$app/navigation';
	import { useProtectedRoute } from '$lib/hooks/useProtectedRoute.svelte.js';
	import Card from '$lib/components/Card.svelte';

	const userStore = useProtectedRoute();

	async function handleLogout() {
		await fetch('/api/logout', {
			method: 'POST'
		});
		userStore.clearUser();
		goto('/login', {
			invalidateAll: true
		});
	}
</script>

<svelte:head>
	<title>Profile - Settings | Silroad</title>
</svelte:head>

{#if userStore.current}
	<div class="space-y-6 p-8">
		<Card variant="form" class="mx-auto max-w-lg">
			<h1 class="mb-4 h2">Profile</h1>

			<div class="space-y-4">
				<div class="flex items-center gap-4">
					{#if userStore.current.image}
						<img src={userStore.current.image} alt="Profile" class="h-16 w-16 rounded-full" />
					{/if}
					<div class="w-full">
						<label for="profile-name" class="sr-only label-text">Name</label>
						<input id="profile-name" class="input w-full" disabled value={userStore.current.name} />
					</div>
				</div>
			</div>
		</Card>
		<Card variant="form" class="mx-auto max-w-lg">
			<button onclick={handleLogout} class="btn w-full preset-filled-warning-900-100">Logout</button
			>
		</Card>
	</div>
{/if}
