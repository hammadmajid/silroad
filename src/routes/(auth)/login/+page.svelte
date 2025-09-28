<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field, Control, Description, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import SuperDebug from 'sveltekit-superforms';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import LogIn from '@lucide/svelte/icons/log-in';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data } = $props();

	function dismissError() {
		const url = new URL($page.url);
		url.searchParams.delete('msg');
		goto(url.pathname + url.search, { replaceState: true });
	}

	// Redirect if user is already logged in
	onMount(() => {
		if (userStore.isLoggedIn) {
			const redirectTo = $page.url.searchParams.get('redirectTo');
			const redirectUrl = redirectTo ? decodeURIComponent(redirectTo) : '/';
			goto(redirectUrl);
		}
	});

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 400,
		onResult: async ({ result }) => {
			if (result.type === 'success' && result.data?.user) {
				// Set user in global store and redirect
				userStore.setUser(result.data.user);
				const redirectTo = $page.url.searchParams.get('redirectTo');
				const redirectUrl = redirectTo ? decodeURIComponent(redirectTo) : '/';
				goto(redirectUrl);
			}
		}
	});
	const { form: formData, enhance, submitting, message } = form;

	// Helper to determine if message is a success message
	function isSuccessMessage(msg: string | null): boolean {
		if (!msg) return false;
		return msg.includes('reset successfully') || msg.includes('Password reset successfully');
	}

	// Get the current message (either from form or URL)
	const currentMessage = $derived($message || $page.url.searchParams.get('msg'));
	const isSuccess = $derived(isSuccessMessage(currentMessage));
</script>

<svelte:head>
	<title>Login | Silroad</title>
</svelte:head>

<section class="space-y-8">
	{#if currentMessage}
		<Alert
			type={isSuccess ? 'success' : 'error'}
			title={isSuccess ? 'Success' : 'Error'}
			dismissible={true}
			onDismiss={dismissError}
			data-testid={isSuccess ? 'success-message' : 'error-message'}
		>
			{#snippet icon()}
				{#if isSuccess}
					<CheckCircle />
				{:else}
					<TriangleAlert />
				{/if}
			{/snippet}
			{currentMessage}
		</Alert>
	{/if}

	<header class="space-y-2 text-center">
		<h1 class="h2">Welcome Back</h1>
		<p class="text-surface-600-300">Sign in to your account</p>
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
				<Description class="sr-only"
					>Provide a valid email address for account verification and communication.</Description
				>
				<FieldErrors class="text-error-700-300" />
			</Field>

			<Field {form} name="password">
				<Control>
					{#snippet children({ props })}
						<label class="label">
							<div class="flex items-center justify-between">
								<span class="label-text">Password</span>
								<a href="/forget-password" class="anchor text-sm">Forgot password?</a>
							</div>
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
				<Description class="sr-only"
					>Choose a strong password with at least 8 characters, including letters and numbers.</Description
				>
				<FieldErrors class="text-error-700-300" />
			</Field>

			<button
				type="submit"
				class="btn flex w-full items-center justify-center gap-2 preset-filled"
				disabled={$submitting}
				data-testid="login-submit-btn"
			>
				{#if $submitting}
					<LoaderCircle class="animate-spin" size={20} />
				{:else}
					<LogIn size={20} />
				{/if}
				Login
			</button>
		</form>
	</Card>

	<footer class="text-center">
		<p class="text-surface-600-300 text-sm">
			Don't have an account?
			<a href="/register" class="anchor">Sign up</a>
		</p>
	</footer>

	{#if !data.isProd}
		<SuperDebug data={$formData} />
	{/if}
</section>
