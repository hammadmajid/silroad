<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { superForm } from 'sveltekit-superforms';
	import { Field, Control, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import Camera from '@lucide/svelte/icons/camera';
	import Save from '@lucide/svelte/icons/save';
	import LogOut from '@lucide/svelte/icons/log-out';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 400,
		onResult: async ({ result }) => {
			if (result.type === 'success' && result.data) {
				// Update user store with new data if update was successful
				const updatedUser = {
					...userStore.current!,
					name: result.data.form.data.name
				};
				userStore.setUser(updatedUser);
			}
		}
	});
	const { form: formData, enhance, submitting, message } = form;

	async function handleLogout() {
		await fetch('/api/logout', {
			method: 'POST'
		});
		userStore.clearUser();
		goto('/login', {
			invalidateAll: true
		});
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
		{#if $message}
			<Alert
				type={$message === 'Profile updated successfully' ? 'success' : 'error'}
				title={$message === 'Profile updated successfully' ? 'Success' : 'Error'}
				dismissible={true}
			>
				{#snippet icon()}
					{#if $message === 'Profile updated successfully'}
						<CheckCircle />
					{:else}
						<TriangleAlert />
					{/if}
				{/snippet}
				{$message}
			</Alert>
		{/if}

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

					<!-- Profile Info Form -->
					<div class="flex-1 space-y-4">
						<form class="space-y-4" method="POST" use:enhance>
							<Field {form} name="name">
								<Control>
									{#snippet children({ props })}
										<label class="label">
											<span class="label-text">Full Name</span>
											<input
												class="input w-full"
												{...props}
												type="text"
												bind:value={$formData.name}
												placeholder="Enter your full name"
											/>
										</label>
									{/snippet}
								</Control>
								<FieldErrors class="text-error-700-300" />
							</Field>

							<div class="space-y-2">
								<label for="join-date" class="label-text">Member Since</label>
								<input id="join-date" value={formatJoinDate()} class="input w-full" disabled />
							</div>

							<!-- Action Buttons -->
							<div class="flex gap-3 pt-4">
								<button
									type="submit"
									class="btn flex items-center gap-2 preset-filled-primary-500"
									disabled={$submitting}
								>
									{#if $submitting}
										<LoaderCircle class="animate-spin" size={16} />
									{:else}
										<Save size={16} />
									{/if}
									Save Changes
								</button>
							</div>
						</form>
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
