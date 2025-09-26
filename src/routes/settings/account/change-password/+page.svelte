<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';
	import Card from '$lib/components/Card.svelte';
	import Key from '@lucide/svelte/icons/key';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		validators: zod4(schema)
	});

	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
</script>

<svelte:head>
	<title>Change Password - Account Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<div class="mb-6">
			<h1 class="h2">Change Password</h1>
		</div>

		{#if $message}
			<div
				class="mb-4 rounded-container border border-error-300 bg-error-50 p-4 dark:border-error-600 dark:bg-error-900/20"
			>
				<p class="text-error-700 dark:text-error-300">{$message}</p>
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<div>
				<label for="current-password" class="mb-2 label-text block">Current Password</label>
				<div class="relative">
					<input
						id="current-password"
						name="currentPassword"
						type={showCurrentPassword ? 'text' : 'password'}
						class="input w-full max-w-md pr-10"
						class:input-error={$errors.currentPassword}
						bind:value={$form.currentPassword}
						placeholder="Enter your current password"
					/>
					<button
						type="button"
						class="text-surface-600-300 hover:text-surface-900-50 absolute top-1/2 right-2 -translate-y-1/2 p-1"
						onclick={() => (showCurrentPassword = !showCurrentPassword)}
					>
						{#if showCurrentPassword}
							<EyeOff size={16} />
						{:else}
							<Eye size={16} />
						{/if}
					</button>
				</div>
				{#if $errors.currentPassword}
					<span class="text-sm text-error-500">{$errors.currentPassword}</span>
				{/if}
			</div>

			<div>
				<label for="new-password" class="mb-2 label-text block">New Password</label>
				<div class="relative">
					<input
						id="new-password"
						name="newPassword"
						type={showNewPassword ? 'text' : 'password'}
						class="input w-full max-w-md pr-10"
						class:input-error={$errors.newPassword}
						bind:value={$form.newPassword}
						placeholder="Enter your new password"
					/>
					<button
						type="button"
						class="text-surface-600-300 hover:text-surface-900-50 absolute top-1/2 right-2 -translate-y-1/2 p-1"
						onclick={() => (showNewPassword = !showNewPassword)}
					>
						{#if showNewPassword}
							<EyeOff size={16} />
						{:else}
							<Eye size={16} />
						{/if}
					</button>
				</div>
				{#if $errors.newPassword}
					<span class="text-sm text-error-500">{$errors.newPassword}</span>
				{/if}
				<p class="text-surface-600-300 mt-1 text-sm">
					Password must be 8+ characters with letters, numbers and special characters.
				</p>
			</div>

			<div>
				<label for="confirm-password" class="mb-2 label-text block">Confirm New Password</label>
				<div class="relative">
					<input
						id="confirm-password"
						name="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						class="input w-full max-w-md pr-10"
						class:input-error={$errors.confirmPassword}
						bind:value={$form.confirmPassword}
						placeholder="Confirm your new password"
					/>
					<button
						type="button"
						class="text-surface-600-300 hover:text-surface-900-50 absolute top-1/2 right-2 -translate-y-1/2 p-1"
						onclick={() => (showConfirmPassword = !showConfirmPassword)}
					>
						{#if showConfirmPassword}
							<EyeOff size={16} />
						{:else}
							<Eye size={16} />
						{/if}
					</button>
				</div>
				{#if $errors.confirmPassword}
					<span class="text-sm text-error-500">{$errors.confirmPassword}</span>
				{/if}
			</div>

			<div class="flex gap-3">
				<button
					type="submit"
					class="btn flex items-center gap-2 preset-filled-primary-500"
					disabled={$delayed}
				>
					{#if $delayed}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
					{:else}
						<Key size={16} />
					{/if}
					Update Password
				</button>
				<a href="/settings/account" class="btn preset-outlined">Cancel</a>
			</div>
		</form>
	</Card>
</div>
