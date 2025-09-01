<script lang="ts">
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Field, Control, Label, Description, FieldErrors } from 'formsnap';
	import { schema } from './schema.js';
	import Card from '$lib/components/Card.svelte';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Calendar from '@lucide/svelte/icons/calendar';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: zod4Client(schema),
		delayMs: 300
	});
	const { form: formData, enhance, submitting, message } = form;
	const imageProxy = fileProxy(form, 'image');
</script>

<svelte:head>
	<title>Create Event - Management | Silroad</title>
</svelte:head>

<section class="space-y-8">
	<header class="space-y-2">
		<h1 class="h2">Create Event</h1>
		<p class="text-surface-600-300">Set up a new event for your organization.</p>
	</header>

	<Card variant="form" classes="p-6">
		<form class="w-full space-y-4" method="POST" enctype="multipart/form-data" use:enhance>
			{#if $message}
				<div class="card preset-outlined-error-500 p-3 text-sm">{$message}</div>
			{/if}

			<div class="space-y-2">
				<Field {form} name="title">
					<Control>
						{#snippet children({ props })}
							<Label class="label-text">Event title</Label>
							<input
								class="input"
								{...props}
								type="text"
								bind:value={$formData.title}
								placeholder="Annual Tech Meetup"
							/>
						{/snippet}
					</Control>
					<Description class="sr-only">Provide a clear title for your event.</Description>
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
								placeholder="annual-tech-meetup"
							/>
						{/snippet}
					</Control>
					<Description class="text-surface-600-300 text-xs"
						>Lowercase letters, numbers and hyphens only. Used in the event URL.
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
								placeholder="What is your event about? Include agenda, speakers, or any special instructions."
							></textarea>
						{/snippet}
					</Control>
					<Description class="sr-only">Optional description up to 1000 characters.</Description>
					<FieldErrors class="text-error-700-300" />
				</Field>
			</div>

			<div class="flex flex-col gap-4 md:flex-row">
				<div class="flex-1 space-y-2">
					<Field {form} name="dateOfEvent">
						<Control>
							{#snippet children({ props })}
								<Label class="label-text">Event date & time</Label>
								<input
									class="input"
									{...props}
									type="datetime-local"
									bind:value={$formData.dateOfEvent}
								/>
							{/snippet}
						</Control>
						<Description class="sr-only">When will the event take place?</Description>
						<FieldErrors class="text-error-700-300" />
					</Field>
				</div>
				<div class="flex-1 space-y-2">
					<Field {form} name="closeRsvpAt">
						<Control>
							{#snippet children({ props })}
								<Label class="label-text">RSVP deadline (optional)</Label>
								<input
									class="input"
									{...props}
									type="datetime-local"
									bind:value={$formData.closeRsvpAt}
								/>
							{/snippet}
						</Control>
						<Description class="text-surface-600-300 text-xs"
							>When should RSVPs close? Leave empty for no deadline.
						</Description>
						<FieldErrors class="text-error-700-300" />
					</Field>
				</div>
			</div>

			<div class="flex flex-col gap-4 md:flex-row">
				<div class="flex-1 space-y-2">
					<Field {form} name="maxAttendees">
						<Control>
							{#snippet children({ props })}
								<Label class="label-text">Maximum attendees (optional)</Label>
								<input
									class="input"
									{...props}
									type="number"
									min="1"
									bind:value={$formData.maxAttendees}
									placeholder="50"
								/>
							{/snippet}
						</Control>
						<Description class="text-surface-600-300 text-xs"
							>Leave empty for unlimited attendees.
						</Description>
						<FieldErrors class="text-error-700-300" />
					</Field>
				</div>
				<div class="flex-1 space-y-2">
					<label for="event-image" class="label-text">Event image</label>
					<input
						id="event-image"
						class="input"
						type="file"
						name="image"
						accept="image/*"
						bind:files={$imageProxy}
					/>
					<p class="text-surface-600-300 text-xs">Max 5MB. PNG, JPEG, WebP, or AVIF format.</p>
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
					<Calendar size={20} />
				{/if}
				Create Event
			</button>
		</form>
	</Card>
</section>
