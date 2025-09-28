<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field, Control, Description, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Mail from '@lucide/svelte/icons/mail';
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
	<title>Forgot Password | Silroad</title>
</svelte:head>

<section class="space-y-8">
	{#if $message}
		{#if $message.includes('sent')}
			<Alert type="success" title="Email Sent" data-testid="success-message">
				{#snippet icon()}
					<Mail />
				{/snippet}
				{$message}
			</Alert>
		{:else}
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
				{$message}
			</Alert>
		{/if}
	{/if}

	<header class="space-y-2 text-center">
		<h1 class="h2">Forgot Password</h1>
		<p class="text-surface-600-300">Enter your email to receive a password reset link</p>
	</header>

	<Card variant="form" classes="p-6">
		<form class="w-full space-y-4" method="POST" use:enhance>
			<Field {form} name="email">
				<Control>
					{#snippet children({ props })}
						<label class="label">
							<span class="label-text">Email</span>
							<input
								class="input"
								{...props}
								type="email"
								bind:value={$formData.email}
								placeholder="john@example.com"
								data-testid="email-input"
							/>
						</label>
					{/snippet}
				</Control>
				<Description class="sr-only">
					Enter the email address associated with your account.
				</Description>
				<FieldErrors class="text-error-700-300" />
			</Field>

			<button
				type="submit"
				class="btn flex w-full items-center justify-center gap-2 preset-filled"
				disabled={$submitting}
				data-testid="reset-submit-btn"
			>
				{#if $submitting}
					<LoaderCircle class="animate-spin" size={20} />
				{:else}
					<Mail size={20} />
				{/if}
				Send Reset Link
			</button>
		</form>
	</Card>

	<footer class="space-y-2 text-center">
		<p class="text-surface-600-300 text-sm">
			Remember your password?
			<a href="/login" class="anchor">Sign in</a>
		</p>
	</footer>
</section>
