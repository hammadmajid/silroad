<script lang="ts">
	import { page } from '$app/stores';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { Navigation } from '@skeletonlabs/skeleton-svelte';
	import User from '@lucide/svelte/icons/user';
	import Settings from '@lucide/svelte/icons/settings';
	import Users from '@lucide/svelte/icons/users';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Palette from '@lucide/svelte/icons/palette';
	import Bell from '@lucide/svelte/icons/bell';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';

	const navigation = [
		{
			name: 'Profile',
			href: '/settings/profile',
			icon: User
		},
		{
			name: 'Account',
			href: '/settings/account',
			icon: Settings
		},
		{
			name: 'Organization',
			href: '/settings/organization',
			icon: Users
		},
		{
			name: 'Payment',
			href: '/settings/payment',
			icon: CreditCard
		},
		{
			name: 'Appearance',
			href: '/settings/appearance',
			icon: Palette
		},
		{
			name: 'Notifications',
			href: '/settings/notifications',
			icon: Bell
		}
	];

	$: currentPath = $page.url.pathname;
</script>

<svelte:head>
	<title>Settings | Silroad</title>
</svelte:head>

{#if userStore.current}
	<div class="bg-surface-50-900 min-h-screen">
		<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
				<!-- Sidebar -->
				<div class="lg:col-span-1">
					<div class="card preset-filled-surface-100-900 p-6">
						<h2 class="mb-6 h3">Settings</h2>
						<nav class="space-y-1">
							{#each navigation as item (item.href)}
								<a
									href={item.href}
									class="flex items-center gap-3 rounded-container px-3 py-2 text-sm font-medium transition-colors {currentPath ===
									item.href
										? 'preset-filled-primary-500'
										: 'text-surface-600-300 hover:preset-tonal-surface'}"
								>
									<svelte:component this={item.icon} class="h-4 w-4" />
									{item.name}
								</a>
							{/each}
						</nav>
					</div>
				</div>

				<!-- Main content -->
				<div class="lg:col-span-3">
					<slot />
				</div>
			</div>
		</div>
	</div>
{:else}
	<!-- Redirect will happen server-side or client-side -->
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<LoaderCircle class="mx-auto mb-2 animate-spin" size={32} />
			<div>Loading...</div>
		</div>
	</div>
{/if}
