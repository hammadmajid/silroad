<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';
	import Card from '$lib/components/Card.svelte';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	export let data: PageData;

	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		validators: zod4(schema)
	});

	let showPassword = false;
</script>

<svelte:head>
	<title>Delete Account - Account Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="border-error-500 p-6">
		<div class="mb-6">
			<h1 class="h2 text-error-500">Delete Account</h1>
		</div>

		<div
			class="mb-6 rounded-container border border-error-300 bg-error-50 p-4 dark:border-error-600 dark:bg-error-900/20"
		>
			<div class="flex items-start gap-3">
				<AlertTriangle class="mt-0.5 flex-shrink-0 text-error-500" size={20} />
				<div class="space-y-2">
					<h3 class="font-semibold text-error-700 dark:text-error-300">
						Warning: This action cannot be undone
					</h3>
					<div class="space-y-1 text-sm text-error-600 dark:text-error-400">
						<p>Deleting your account will permanently remove:</p>
						<ul class="ml-4 list-disc space-y-1">
							<li>Your profile and all personal information</li>
							<li>All your event RSVPs and attendances</li>
							<li>Your organization memberships and follows</li>
							<li>Any events you're organizing</li>
							<li>All active sessions (you'll be logged out)</li>
						</ul>
					</div>
				</div>
			</div>
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
				<label for="password" class="mb-2 label-text block">Confirm with your password</label>
				<div class="relative">
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						class="input w-full max-w-md pr-10"
						class:input-error={$errors.password}
						bind:value={$form.password}
						placeholder="Enter your password"
					/>
					<button
						type="button"
						class="text-surface-600-300 hover:text-surface-900-50 absolute top-1/2 right-2 -translate-y-1/2 p-1"
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<EyeOff size={16} />
						{:else}
							<Eye size={16} />
						{/if}
					</button>
				</div>
				{#if $errors.password}
					<span class="text-sm text-error-500">{$errors.password}</span>
				{/if}
			</div>

			<div>
				<label for="confirm-text" class="mb-2 label-text block">Type "DELETE" to confirm</label>
				<input
					id="confirm-text"
					name="confirmText"
					type="text"
					class="input w-full max-w-md"
					class:input-error={$errors.confirmText}
					bind:value={$form.confirmText}
					placeholder="DELETE"
				/>
				{#if $errors.confirmText}
					<span class="text-sm text-error-500">{$errors.confirmText}</span>
				{/if}
			</div>

			<div class="flex gap-3">
				<button
					type="submit"
					class="btn flex items-center gap-2 preset-filled-error-500"
					disabled={$delayed || !$form.password || $form.confirmText !== 'DELETE'}
				>
					{#if $delayed}
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
						></div>
					{:else}
						<Trash2 size={16} />
					{/if}
					Delete Account Permanently
				</button>
				<a href="/settings/account" class="btn preset-outlined">Cancel</a>
			</div>
		</form>
	</Card>
</div>
