<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { Field, Control, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import Camera from '@lucide/svelte/icons/camera';
	import Save from '@lucide/svelte/icons/save';
	import LogOut from '@lucide/svelte/icons/log-out';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import User from '@lucide/svelte/icons/user';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';

	let { data } = $props();
	const createdAt: string | Date = data.createdAt;

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 400,
	});
	const { form: formData, submitting, message, enhance } = form;
	const imageProxy = fileProxy(form, 'image');

	async function handleLogout() {
		await fetch('/api/logout', {
			method: 'POST'
		});
		userStore.clearUser();
		goto('/login', {
			invalidateAll: true
		});
	}

	function formatJoinDate(): string {
		if (!createdAt) return '';
		const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
		return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function handleImageClick() {
		const input = document.getElementById('profile-image') as HTMLInputElement;
		input?.click();
	}
</script>

<svelte:head>
	<title>Profile - Settings | Silroad</title>
</svelte:head>

<div class="space-y-8">
	{#if $message}
		<Alert
			type={$message === 'Profile updated successfully' ? 'success' : 'error'}
			title={$message === 'Profile updated successfully' ? 'Success' : 'Error'}
			dismissible={true}
			data-testid={$message === 'Profile updated successfully'
				? 'success-message'
				: 'error-message'}
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
					<Avatar
						src={userStore.current?.image || undefined}
						name="User"
						size="w-24 h-24"
						background="preset-filled-primary-500"
					>
						<User class="h-24 w-24" />
					</Avatar>
					<button
						type="button"
						onclick={handleImageClick}
						class="btn flex items-center gap-2 preset-outlined btn-sm"
					>
						<Camera size={16} />
						Change photo
					</button>
					{#if $imageProxy && $imageProxy.length > 0}
						<p class="text-surface-600-300 text-xs">Selected: {$imageProxy[0].name}</p>
					{:else}
						<p class="text-surface-600-300 text-xs">Max 5MB. PNG, JPEG, WebP, or AVIF format.</p>
					{/if}
				</div>

				<!-- Profile Info Form -->
				<div class="flex-1 space-y-4">
					<form class="space-y-4" method="POST" enctype="multipart/form-data" use:enhance>
						<!-- Hidden file input -->
						<input
							id="profile-image"
							type="file"
							name="image"
							accept="image/*"
							bind:files={$imageProxy}
							class="hidden"
						/>

						<Field {form} name="image">
							<FieldErrors class="text-error-700-300" />
						</Field>

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
											data-testid="name-input"
										/>
									</label>
								{/snippet}
							</Control>
							<FieldErrors class="text-error-700-300" />
						</Field>

						<div class="space-y-2">
							<label for="join-date" class="label-text">Member Since</label>
							<input
								id="join-date"
								value={formatJoinDate()}
								class="input w-full"
								disabled
								data-testid="join-date-input"
							/>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-3 pt-4">
							<button
								type="submit"
								class="btn flex items-center gap-2 preset-filled-primary-500"
								disabled={$submitting}
								data-testid="save-changes-btn"
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
					data-testid="logout-btn"
				>
					<LogOut size={16} />
					Sign Out
				</button>
			</div>
		</Card>
	</section>
</div>
