<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field, Control, Description, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Key from '@lucide/svelte/icons/key';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data } = $props();

	function dismissError() {
		const url = new URL($page.url);
		url.searchParams.delete('msg');
		goto(url.pathname + url.search, { replaceState: true });
	}

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 400
	});
	const { form: formData, enhance, submitting, message } = form;
</script>

<svelte:head>
	<title>Reset Password | Silroad</title>
</svelte:head>

<section class="space-y-8">
	{#if $message || $page.url.searchParams.get('msg')}
		<Alert
			type="error"
			title="Error"
			dismissible={true}
			onDismiss={dismissError}
			data-testid="error-message"
		>
			{#snippet icon()}
				<TriangleAlert />
			{/snippet}
			{$message || $page.url.searchParams.get('msg')}
		</Alert>
	{/if}

	<header class="space-y-2 text-center">
		<h1 class="h2">Reset Password</h1>
		<p class="text-surface-600-300">Enter your new password</p>
	</header>

	<Card variant="form" classes="p-6">
		<form class="w-full space-y-4" method="POST" use:enhance>
			<Field {form} name="password">
				<Control>
					{#snippet children({ props })}
						<label class="label">
							<span class="label-text">New Password</span>
							<input
								class="input"
								{...props}
								type="password"
								bind:value={$formData.password}
								data-testid="password-input"
							/>
						</label>
					{/snippet}
				</Control>
				<Description class="text-surface-600-300 text-sm">
					Password must be 8+ characters with letters, numbers and special characters.
				</Description>
				<FieldErrors class="text-error-700-300" />
			</Field>

			<Field {form} name="confirmPassword">
				<Control>
					{#snippet children({ props })}
						<label class="label">
							<span class="label-text">Confirm New Password</span>
							<input
								class="input"
								{...props}
								type="password"
								bind:value={$formData.confirmPassword}
								data-testid="confirm-password-input"
							/>
						</label>
					{/snippet}
				</Control>
				<Description class="sr-only">Re-enter your new password to confirm.</Description>
				<FieldErrors class="text-error-700-300" />
			</Field>

			<button
				type="submit"
				class="btn flex w-full items-center justify-center gap-2 preset-filled"
				disabled={$submitting}
				data-testid="reset-password-btn"
			>
				{#if $submitting}
					<LoaderCircle class="animate-spin" size={20} />
				{:else}
					<Key size={20} />
				{/if}
				Reset Password
			</button>
		</form>
	</Card>

	<footer class="text-center">
		<p class="text-surface-600-300 text-sm">
			Remember your password?
			<a href="/login" class="anchor">Sign in</a>
		</p>
	</footer>
</section>
