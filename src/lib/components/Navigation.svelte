<script lang="ts">
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores/user.svelte.js';

	import CalendarHeart from '@lucide/svelte/icons/calendar-heart';
	import Search from '@lucide/svelte/icons/search';
	import Building from '@lucide/svelte/icons/building';
	import Settings from '@lucide/svelte/icons/settings';
	import User from '@lucide/svelte/icons/user';
	import Users from '@lucide/svelte/icons/users';
	import HelpCircle from '@lucide/svelte/icons/help-circle';

	import type { Component } from 'svelte';

	interface NavItem {
		href: string;
		label: string;
		icon: Component;
		requiresAuth?: boolean;
	}

	const navItems: NavItem[] = [
		{ href: '/explore', label: 'Explore Events', icon: Search },
		{ href: '/explore/orgs', label: 'Organizations', icon: Building },
		{ href: '/settings/profile', label: 'Profile', icon: User, requiresAuth: true },
		{ href: '/settings/organization', label: 'My Organizations', icon: Users, requiresAuth: true },
		{ href: '/settings', label: 'Settings', icon: Settings, requiresAuth: true },
		{ href: '/help', label: 'Help & Support', icon: HelpCircle }
	];

	const currentPath = $derived($page.url.pathname);
	const filteredItems = $derived(
		navItems.filter((item) => !item.requiresAuth || userStore.isLoggedIn)
	);

	function isActive(href: string): boolean {
		if (href === '/explore') {
			return currentPath === href;
		}
		return currentPath.startsWith(href);
	}
</script>

<nav class="h-full w-64 bg-surface-50-950 p-4">
	<div class="space-y-6">
		<!-- Logo/Brand -->
		<div class="flex items-center gap-2 px-2">
			<CalendarHeart size={24} class="text-primary-600" />
			<span class="text-lg font-bold">Silroad</span>
		</div>

		<!-- Navigation Links -->
		<ul class="space-y-1">
			{#each filteredItems as item (item.href)}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 {isActive(
							item.href
						)
							? 'bg-primary-500 text-white'
							: 'text-surface-700-200 hover:bg-surface-200-800'}"
					>
						<item.icon size={18} />
						<span class="text-sm font-medium">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>

		<!-- User Section -->
		{#if userStore.isLoggedIn}
			<div class="border-t border-surface-300-700 pt-4">
				<div class="px-3 py-2">
					<p class="text-surface-500-400 text-xs font-semibold tracking-wide uppercase">Account</p>
					<p class="text-surface-700-200 mt-1 text-sm font-medium">
						{userStore.current?.name || 'User'}
					</p>
					<p class="text-surface-500-400 text-xs">
						{userStore.current?.email || ''}
					</p>
				</div>
			</div>
		{/if}
	</div>
</nav>
