<script lang="ts">
	import Card from './Card.svelte';
	import type { Event } from '$lib/types';

	interface Props {
		event: Event;
	}

	let { event }: Props = $props();
</script>

<Card variant="interactive" href={`/explore/events/${event.slug}`} data-testid="event-card">
	{#snippet header()}
		{#if event.image}
			<img
				src={event.image}
				alt={event.description}
				class="aspect-[21/9] w-full rounded-lg object-cover"
			/>
		{/if}
	{/snippet}

	<div class="space-y-2">
		<h3 class="h3">{event.title}</h3>
	</div>
	<p class="text-surface-600-300">
		{event.description}
	</p>

	{#snippet footer()}
		<small class="text-surface-600-300">Learn more</small>
		<small class="text-surface-600-300">→</small>
	{/snippet}
</Card>
