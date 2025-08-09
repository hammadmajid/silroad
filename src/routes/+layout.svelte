<script lang="ts">
	import type { LayoutProps } from './$types';

	import '../app.css';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { onMount } from 'svelte';

	import CalendarHeart from '@lucide/svelte/icons/calendar-heart';
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

	const homeLink = userStore.isLoggedIn ? '/explore' : '/';
</script>

<div class="flex flex-col h-full">
	<AppBar>
		{#snippet lead()}
			<a href={homeLink}>
				<CalendarHeart size={24} />
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

	<main class="grow">
		{@render children()}
	</main>

	<footer class="mt-16 bg-surface-100-900">
		<div class="container mx-auto px-4 py-8">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<div>
					<h3 class="mb-4 text-lg font-semibold">Silroad</h3>
					<p>
						An event organizer platform that helps organizations create, manage, and promote events.
					</p>
				</div>
				<div>
					<h4 class="mb-4 font-semibold">Platform</h4>
					<ul class="space-y-2">
						<li><a href="/explore" class="anchor text-sm">Explore Events</a></li>
						<li>
							<a href="/explore?filter=organizations" class="anchor text-sm">Find Organizations</a>
						</li>
						<li><a href="/about" class="anchor text-sm">About</a></li>
						<li><a href="/help" class="anchor text-sm">Help & Support</a></li>
					</ul>
				</div>
				<div>
					<h4 class="mb-4 font-semibold">Legal</h4>
					<ul class="space-y-2">
						<li><a href="/privacy" class="anchor text-sm">Privacy Policy</a></li>
						<li><a href="/terms" class="anchor text-sm">Terms of Service</a></li>
						<li><a href="/contact" class="anchor text-sm">Contact Us</a></li>
					</ul>
				</div>
			</div>
			<div class="mt-8 border-t border-surface-400 pt-8 text-center">
				<p class="text-sm text-surface-400">
					© {new Date().getFullYear()} Silroad. All rights reserved.
				</p>
			</div>
		</div>
	</footer>
</div>
