<script lang="ts">
	import type { LayoutProps } from './$types';

	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { onMount } from 'svelte';

	import Building2 from '@lucide/svelte/icons/building-2';
	import User from '@lucide/svelte/icons/user';

	let { data, children }: LayoutProps = $props();

	// Initialize user store from server data if user is logged in and store is empty
	onMount(() => {
		if (data && data.id && !userStore.current) {
			userStore.setUser({
				id: data.id,
				email: data.email,
				name: data.name,
				image: data.image
			});
		}
	});
</script>

<AppBar>
	{#snippet lead()}
		<a href="/">
			<Building2 size={24} />
		</a>
	{/snippet}
	{#snippet trail()}
		<ul class="flex items-center gap-4">
			<li>
				<a href="/explore" class="anchor">Explore</a>
			</li>
			{#if userStore.isLoggedIn}
				<li>
					<a href="/settings/profile" class="btn-icon preset-filled" title="Profile">
						<User />
					</a>
				</li>
			{:else}
				<li>
					<a href="/login" class="btn preset-filled">Login</a>
				</li>
			{/if}
		</ul>
	{/snippet}
</AppBar>
<main>
	{@render children()}
</main>
