<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { Field, Control, Label, Description, FieldErrors } from 'formsnap';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { schema } from './schema.js';
	import SuperDebug from 'sveltekit-superforms';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/user.svelte.js';
	import { onMount } from 'svelte';

	let { data } = $props();

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
	<title>Register | Silroad</title>
</svelte:head>

<div class="space-y-4">
	{#if $message}
		<div
			class="w-full card preset-filled-error-700-300 p-4 text-center"
			data-testid="error-message"
		>
			<p>{$message}</p>
		</div>
	{/if}

	<div class="mb-6 space-y-2 text-center">
		<h1 class="h2">Create Account</h1>
		<p class="text-surface-600-300">Join Silroad today</p>
	</div>

	<form class="w-full space-y-4 card preset-filled-surface-100-900 p-6" method="POST" use:enhance>
		<div class="flex flex-col gap-4 md:flex-row">
			<div class="flex-1 space-y-2">
				<Field {form} name="firstName">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">First name</Label>
							<input
								class="input"
								{...props}
								type="text"
								bind:value={$formData.firstName}
								placeholder="John"
								data-testid="first-name-input"
							/>
						{/snippet}
					</Control>
					<Description class="sr-only"
						>Enter your given name as it appears on official documents.</Description
					>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>
			<div class="flex-1 space-y-2">
				<Field {form} name="lastName">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Last name</Label>
							<input
								class="input"
								{...props}
								type="text"
								bind:value={$formData.lastName}
								placeholder="Doe"
								data-testid="last-name-input"
							/>
						{/snippet}
					</Control>
					<Description class="sr-only">Enter your family name or surname.</Description>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>
		</div>
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

		<Field {form} name="agree">
			<Control>
				{#snippet children({ props })}
					<div class="flex items-center space-x-2">
						<input
							class="checkbox"
							{...props}
							type="checkbox"
							bind:checked={$formData.agree}
							data-testid="terms-checkbox"
						/>
						<label for={props.id} class="label-text cursor-pointer select-none">
							I agree to the <a href="/terms" class="anchor">Terms</a> and
							<a href="/privacy" class="anchor">Privacy Policy</a>
						</label>
					</div>
				{/snippet}
			</Control>
			<Description class="sr-only">
				You must agree to our Terms of Service and Privacy Policy to create an account.
			</Description>
			<FieldErrors class="text-error-700-300" />
		</Field>

		<button
			type="submit"
			class="btn w-full preset-filled"
			disabled={$submitting}
			data-testid="register-submit-btn"
		>
			Register
			{#if $delayed}
				<LoaderCircle class="animate-spin" />
			{/if}
		</button>
	</form>

	<div class="text-center">
		<p class="text-surface-600-300 text-sm">
			Already have an account?
			<a href="/login" class="anchor">Sign in</a>
		</p>
	</div>

	{#if !data.isProd}
		<SuperDebug data={$formData} />
	{/if}
</div>
