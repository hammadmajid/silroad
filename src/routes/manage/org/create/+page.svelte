<script lang="ts">
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Field, Control, Label, Description, FieldErrors } from 'formsnap';
	import { schema } from './schema.js';
	import Card from '$lib/components/Card.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Building2 from '@lucide/svelte/icons/building-2';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 300
	});
	const { form: formData, enhance, submitting, message } = form;
	const avatarProxy = fileProxy(form, 'avatar');
	const backgroundImageProxy = fileProxy(form, 'backgroundImage');
</script>

<svelte:head>
	<title>Create Organization - Settings | Silroad</title>
</svelte:head>

<section class="space-y-8">
	<header class="space-y-2">
		<h1 class="h2">Create Organization</h1>
		<p class="text-surface-600-300">Set up a new organization to collaborate with your team.</p>
	</header>

	<Card variant="form" classes="p-6">
		<form class="w-full space-y-4" method="POST" enctype="multipart/form-data" use:enhance>
			{#if $message}
				<div class="card preset-outlined-error-500 p-3 text-sm">{$message}</div>
			{/if}

			<div class="space-y-2">
				<Field {form} name="name">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Organization name</Label>
							<input
								class="input"
								{...props}
								type="text"
								bind:value={$formData.name}
								placeholder="Acme Inc"
							/>
						{/snippet}
					</Control>
					<Description class="sr-only">Provide a clear name for your organization.</Description>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>

			<div class="space-y-2">
				<Field {form} name="slug">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Slug</Label>
							<input
								class="input"
								{...props}
								type="text"
								bind:value={$formData.slug}
								placeholder="acme-inc"
							/>
						{/snippet}
					</Control>
					<Description class="text-surface-600-300 text-xs"
						>Lowercase letters, numbers and hyphens only.
					</Description>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>

			<div class="space-y-2">
				<Field {form} name="description">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Description</Label>
							<textarea
								class="textarea"
								rows="4"
								{...props}
								bind:value={$formData.description}
								placeholder="What is your organization about?"
							></textarea>
						{/snippet}
					</Control>
					<Description class="sr-only">Optional description up to 500 characters.</Description>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>

			<div class="flex flex-col gap-4 md:flex-row">
				<div class="flex-1 space-y-2">
					<label for="avatar" class="label-text">Avatar image</label>
					<input
						id="avatar"
						class="input"
						type="file"
						name="avatar"
						accept="image/*"
						bind:files={$avatarProxy}
					/>
				</div>
				<div class="flex-1 space-y-2">
					<label for="background" class="label-text">Background image</label>
					<input
						id="background"
						class="input"
						type="file"
						name="backgroundImage"
						accept="image/*"
						bind:files={$backgroundImageProxy}
					/>
				</div>
			</div>

			<button
				type="submit"
				class="btn flex w-full items-center justify-center gap-2 preset-filled"
				disabled={$submitting}
			>
				{#if $submitting}
					<LoaderCircle class="animate-spin" size={20} />
				{:else}
					<Building2 size={20} />
				{/if}
				Create Organization
			</button>
		</form>
	</Card>
</section>
