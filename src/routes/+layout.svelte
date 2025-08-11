<script lang="ts">
	import type { LayoutProps } from './$types';

	import '../app.css';
	import { AppBar, Avatar } from '@skeletonlabs/skeleton-svelte';
	import { userStore } from '$lib/stores/user.svelte.js';

	import CalendarHeart from '@lucide/svelte/icons/calendar-heart';
	import User from '@lucide/svelte/icons/user';
	import LogIn from '@lucide/svelte/icons/log-in';

	let { data, children }: LayoutProps = $props();

	// Update user store when server data changes
	$effect(() => {
		if (data && data.id) {
			userStore.setUser({
				id: data.id,
				email: data.email,
				name: data.name,
				image: data.image
			});
		} else {
			userStore.clearUser();
		}
	});

	const homeLink = userStore.isLoggedIn ? '/explore' : '/';
</script>

<div class="flex h-full flex-col">
	<AppBar>
		{#snippet lead()}
			<a href={homeLink} class="flex justify-center items-center gap-2">
				<CalendarHeart size={24} />
				<span class="font-bold text-lg">Silroad</span>
			</a>
		{/snippet}
		{#snippet trail()}
			<ul class="flex items-center gap-4">
				<li>
					<a href="/explore" class="anchor">Explore</a>
				</li>
				{#if userStore.isLoggedIn}
					<li>
						<a href="/settings/profile" title="Profile">
							<Avatar 
								src={userStore.current?.image} 
								name={userStore.current?.name || 'User'} 
								size="w-8"
								background="preset-filled-primary-500"
							>
								<User size={16} />
							</Avatar>
						</a>
					</li>
				{:else}
					<li>
						<a href="/login" class="btn preset-filled flex items-center gap-2">
							<LogIn size={20} />
							Login
						</a>
					</li>
				{/if}
			</ul>
		{/snippet}
	</AppBar>

	<main class="grow">
		{@render children()}
	</main>

	<footer class="bg-surface-100-900">
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
						<li><a href="mailto:contact@silroad.space" class="anchor text-sm">Contact Us</a></li>
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
