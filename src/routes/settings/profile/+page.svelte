<script lang="ts">
	import { useProtectedRoute } from '$lib/hooks/useProtectedRoute.svelte.js';

	const userStore = useProtectedRoute();
</script>

<svelte:head>
	<title>Profile - Settings | Silroad</title>
</svelte:head>

{#if userStore.current}
	<div class="space-y-6">
		<div class="card preset-filled-surface-100-900 p-6">
			<h1 class="h2 mb-4">Profile Settings</h1>

			<div class="space-y-4">
				<div>
					<p class="label-text">Name</p>
					<p class="text-lg">{userStore.current.name}</p>
				</div>

				<div>
					<p class="label-text">Email</p>
					<p class="text-lg">{userStore.current.email}</p>
				</div>

				{#if userStore.current.image}
					<div>
						<p class="label-text">Profile Image</p>
						<img
							src={userStore.current.image}
							alt="Profile"
							class="w-16 h-16 rounded-full"
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
