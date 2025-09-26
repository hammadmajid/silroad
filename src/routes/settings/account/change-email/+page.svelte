<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { schema } from './schema';
	import Card from '$lib/components/Card.svelte';
	import Mail from '@lucide/svelte/icons/mail';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		validators: zod4(schema)
	});
</script>

<svelte:head>
	<title>Change Email - Account Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-8 h2">Change Email Address</h1>

		{#if $message}
			<div
				class="mb-4 rounded-container border border-error-300 bg-error-50 p-4 dark:border-error-600 dark:bg-error-900/20"
			>
				<p class="text-error-700 dark:text-error-300">{$message}</p>
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-6">
			<div>
				<label for="current-email" class="mb-2 label-text block">Current Email</label>
				<input
					id="current-email"
					class="input w-full max-w-md"
					value={data.currentEmail}
					disabled
				/>
			</div>

			<div>
				<label for="email" class="mb-2 label-text block">New Email Address</label>
				<input
					id="email"
					name="email"
					type="email"
					class="input w-full max-w-md"
					class:input-error={$errors.email}
					bind:value={$form.email}
					placeholder="Enter your new email address"
				/>
				{#if $errors.email}
					<span class="text-sm text-error-500">{$errors.email}</span>
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
						<Mail size={16} />
					{/if}
					Update Email
				</button>
				<a href="/settings/account" class="btn preset-outlined">Cancel</a>
			</div>
		</form>
	</Card>
</div>
