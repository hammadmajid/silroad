<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field, Control, Label, Description, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import SuperDebug from 'sveltekit-superforms';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import LogIn from '@lucide/svelte/icons/log-in';
	import X from '@lucide/svelte/icons/x';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Card from '$lib/components/Card.svelte';

	let { data } = $props();

	function dismissError() {
		const url = new URL($page.url);
		url.searchParams.delete('msg');
		goto(url.pathname + url.search, { replaceState: true });
	}

	// Redirect if user is already logged in
	onMount(() => {
		if (userStore.isLoggedIn) {
			goto('/explore');
		}
	});

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 400,
		onResult: async ({ result }) => {
			if (result.type === 'success' && result.data?.user) {
				// Set user in global store and redirect
				userStore.setUser(result.data.user);
				goto('/explore');
			}
		}
	});
	const { form: formData, enhance, submitting, delayed, message } = form;
</script>

<svelte:head>
	<title>Login | Silroad</title>
</svelte:head>

<div class="space-y-4">
	{#if $message || $page.url.searchParams.get('msg')}
		<div class="card preset-outlined-error-500 grid grid-cols-1 items-center gap-4 p-4 lg:grid-cols-[auto_1fr_auto]" data-testid="error-message">
			<TriangleAlert />
			<div>
				<p class="font-bold">Error</p>
				<p class="text-xs opacity-60">{$message || $page.url.searchParams.get('msg')}</p>
			</div>
			<div class="flex gap-1">
				<button class="btn preset-tonal hover:preset-filled flex items-center gap-2" onclick={dismissError}>
					<X size={16} />
					Dismiss
				</button>
			</div>
		</div>
	{/if}

	<div class="mb-6 space-y-2 text-center">
		<h1 class="h2">Welcome Back</h1>
		<p class="text-surface-600-300">Sign in to your account</p>
	</div>

	<Card variant="form">
		<form class="w-full space-y-4" method="POST" use:enhance>
			<div class="space-y-2">
				<Field {form} name="email">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Email</Label>
							<input
								class="input"
								{...props}
								type="email"
								bind:value={$formData.email}
								placeholder="john@example.com"
								data-testid="email-input"
							/>
						{/snippet}
					</Control>
					<Description class="sr-only"
						>Provide a valid email address for account verification and communication.</Description
					>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>
			<div class="space-y-2">
				<Field {form} name="password">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Password</Label>
							<input
								class="input"
								{...props}
								type="password"
								bind:value={$formData.password}
								data-testid="password-input"
							/>
						{/snippet}
					</Control>
					<Description class="sr-only"
						>Choose a strong password with at least 8 characters, including letters and numbers.</Description
					>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>

			<button
				type="submit"
				class="btn w-full preset-filled flex items-center justify-center gap-2"
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

	<div class="text-center">
		<p class="text-surface-600-300 text-sm">
			Don't have an account?
			<a href="/register" class="anchor">Sign up</a>
		</p>
	</div>

	{#if !data.isProd}
		<SuperDebug data={$formData} />
	{/if}
</div>
