<script lang="ts">
	import Card from './Card.svelte';
	import type { Organization } from '$lib/types';

	interface Props {
		org: Organization;
	}

	let { org }: Props = $props();
</script>

<Card
	variant="interactive"
	href={`/explore/orgs/${org.slug}`}
	data-testid="org-card"
>
	{#snippet header()}
		{#if org.avatar}
			<img
				src={org.avatar}
				alt={org.description}
				class="aspect-[21/9] w-full rounded-lg object-cover"
			/>
		{/if}
	{/snippet}

	<div class="space-y-2">
		<h2 class="h6 text-primary-500">Organization</h2>
		<h3 class="h3">{org.name}</h3>
	</div>
	<p class="text-surface-600-300">
		{org.description}
	</p>

	{#snippet footer()}
		<small class="text-surface-600-300">Learn more</small>
		<small class="text-surface-600-300">→</small>
	{/snippet}
</Card>


