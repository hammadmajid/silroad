<script lang="ts">
	import type { LayoutProps } from './$types';

	import '../app.css';
	import { AppBar, Avatar } from '@skeletonlabs/skeleton-svelte';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { initTheme } from '$lib/stores/theme.js';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { generateBreadcrumbs } from '$lib/utils/breadcrumbs.js';
	import { page } from '$app/stores';
	import { SvelteKitTopLoader } from 'sveltekit-top-loader';
	import User from '@lucide/svelte/icons/user';
	import LogIn from '@lucide/svelte/icons/log-in';

	let { data, children }: LayoutProps = $props();

	// Initialize theme management
	$effect(() => {
		initTheme();
	});

	// Update user store when server data changes
	$effect(() => {
		if (data && data.id) {
			userStore.setUser({
				id: data.id,
				image: data.image
			});
		} else {
			userStore.clearUser();
		}
	});

	// Generate breadcrumbs based on current page
	const breadcrumbs = $derived(generateBreadcrumbs($page, data));
	const showBreadcrumbs = $derived($page.url.pathname !== '/');
</script>

<div class="flex h-full flex-col">
	<SvelteKitTopLoader color="#e9851d" showSpinner={false} />
	<AppBar>
		{#snippet lead()}
			<a href="/" class="flex items-center gap-2">
				<span class="text-lg leading-none font-bold">Silroad</span>
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
								src={userStore.current?.image || undefined}
								name="User"
								size="w-8 h-8"
								background="preset-filled-primary-500"
							>
								<User class="h-8 w-8" />
							</Avatar>
						</a>
					</li>
				{:else}
					<li>
						<a href="/login" class="btn flex items-center gap-2 preset-filled">
							<LogIn size={20} />
							Login
						</a>
					</li>
				{/if}
			</ul>
		{/snippet}
	</AppBar>

	<main class="container mx-auto px-2 py-8 sm:px-4">
		{#if showBreadcrumbs}
			<Breadcrumb items={breadcrumbs} />
		{/if}
		{@render children()}
	</main>

	<footer class="border-t border-surface-300-700 bg-surface-100-900">
		<div class="container mx-auto px-2 py-8 sm:px-4">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				<div class="space-y-4">
					<h3 class="text-lg font-semibold">Silroad</h3>
					<p class="text-surface-600-300">
						An event organizer platform that helps organizations create, manage, and promote events.
					</p>
				</div>
				<div class="space-y-4">
					<h4 class="font-semibold">Platform</h4>
					<ul class="space-y-2">
						<li><a href="/explore/events" class="anchor text-sm">Explore Events</a></li>
						<li>
							<a href="/explore/orgs" class="anchor text-sm">Find Organizations</a>
						</li>
						<li><a href="/about" class="anchor text-sm">About</a></li>
						<li><a href="/help" class="anchor text-sm">Help & Support</a></li>
					</ul>
				</div>
				<div class="space-y-4">
					<h4 class="font-semibold">Legal</h4>
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
