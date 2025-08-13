<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import { userStore } from '$lib/stores/user.svelte.js';
	import Camera from '@lucide/svelte/icons/camera';
	import Edit from '@lucide/svelte/icons/edit';
	import Save from '@lucide/svelte/icons/save';
	import X from '@lucide/svelte/icons/x';
	import LogOut from '@lucide/svelte/icons/log-out';

	let isEditing = $state(false);
	let editedName = $state('');

	$effect(() => {
		if (userStore.current) {
			editedName = userStore.current.name;
		}
	});

	async function handleLogout() {
		await fetch('/api/logout', {
			method: 'POST'
		});
		userStore.clearUser();
		goto('/login', {
			invalidateAll: true
		});
	}

	function startEditing() {
		isEditing = true;
		editedName = userStore.current?.name || '';
	}

	function cancelEditing() {
		isEditing = false;
		editedName = userStore.current?.name || '';
	}

	async function saveProfile() {
		// TODO: Implement save functionality
		console.log('Save profile:', { name: editedName });
		isEditing = false;
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	function formatJoinDate(): string {
		// Extract timestamp from UUID v7 (first 48 bits are timestamp)
		// This is a simplified version - in reality you'd want proper date tracking
		return 'Member since 2024';
	}
</script>

<svelte:head>
	<title>Profile - Settings | Silroad</title>
</svelte:head>

{#if userStore.current}
	<div class="space-y-8">
		<section class="space-y-6">
			<header>
				<h1 class="h2">Profile</h1>
			</header>

			<Card class="space-y-6 p-6">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-start">
					<!-- Avatar Section -->
					<div class="flex flex-col items-center gap-4">
						<div class="relative">
							{#if userStore.current.image}
								<img
									src={userStore.current.image}
									alt="Profile"
									class="border-surface-300-600 h-24 w-24 rounded-full border-4 object-cover"
								/>
							{:else}
								<div
									class="border-surface-300-600 flex h-24 w-24 items-center justify-center rounded-full border-4 bg-primary-500 text-2xl font-bold text-white"
								>
									{getInitials(userStore.current.name)}
								</div>
							{/if}
							<button
								class="bg-surface-100-800 text-surface-600-300 hover:bg-surface-200-700 absolute -right-1 -bottom-1 rounded-full p-2"
								aria-label="Edit profile photo"
							>
								<Camera class="h-4 w-4" />
							</button>
						</div>
						<button class="btn flex items-center gap-2 preset-outlined btn-sm">
							<Camera size={16} />
							Change photo
						</button>
					</div>

					<!-- Profile Info -->
					<div class="flex-1 space-y-4">
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<label for="name" class="label-text">Full Name</label>
								{#if isEditing}
									<input
										id="name"
										bind:value={editedName}
										class="input w-full"
										placeholder="Enter your full name"
									/>
								{:else}
									<input id="name" value={userStore.current.name} class="input w-full" disabled />
								{/if}
							</div>

							<div class="space-y-2">
								<label for="email" class="label-text">Email</label>
								<input id="email" value={userStore.current.email} class="input w-full" disabled />
							</div>
						</div>

						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<label for="user-id" class="label-text">User ID</label>
								<input
									id="user-id"
									value={userStore.current.id}
									class="input w-full font-mono text-sm"
									disabled
								/>
							</div>

							<div class="space-y-2">
								<label for="join-date" class="label-text">Member Since</label>
								<input id="join-date" value={formatJoinDate()} class="input w-full" disabled />
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-3 pt-4">
							{#if isEditing}
								<button
									onclick={saveProfile}
									class="btn flex items-center gap-2 preset-filled-primary-500"
								>
									<Save size={16} />
									Save Changes
								</button>
								<button onclick={cancelEditing} class="btn flex items-center gap-2 preset-outlined">
									<X size={16} />
									Cancel
								</button>
							{:else}
								<button
									onclick={startEditing}
									class="btn flex items-center gap-2 preset-filled-primary-500"
								>
									<Edit size={16} />
									Edit Profile
								</button>
							{/if}
						</div>
					</div>
				</div>
			</Card>
		</section>

		<section class="space-y-6">
			<Card variant="form" class="space-y-4 p-6">
				<div
					class="flex items-center justify-between rounded-lg border border-error-300 bg-error-50 p-4 dark:border-error-600 dark:bg-error-900/20"
				>
					<div class="space-y-1">
						<h3 class="font-medium text-error-700 dark:text-error-300">Sign Out</h3>
						<p class="text-sm text-error-600 dark:text-error-400">
							Sign out of your account on this device
						</p>
					</div>
					<button
						onclick={handleLogout}
						class="btn flex items-center gap-2 preset-filled-error-500 btn-sm"
					>
						<LogOut size={16} />
						Sign Out
					</button>
				</div>
			</Card>
		</section>
	</div>
{/if}
