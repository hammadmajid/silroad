<script lang="ts">
	import Card from './Card.svelte';
	import type { Organization } from '$lib/types';

	interface Props {
		org: Organization;
	}

	let { org }: Props = $props();
</script>

<Card variant="interactive" href={`/explore/orgs/${org.slug}`} data-testid="org-card">
	{#snippet header()}
		<div class="relative w-full">
			{#if org.backgroundImage}
				<img
					src={org.backgroundImage}
					alt={`${org.name} background`}
					class="aspect-[21/9] w-full rounded-lg object-cover"
				/>
			{/if}
			{#if org.avatar}
				<img
					src={org.avatar}
					alt={`${org.name} avatar`}
					class="absolute bottom-2 left-2 h-20 w-20 rounded-full border-2 border-surface-100-900 bg-surface-100-900 object-cover"
				/>
			{/if}
		</div>
	{/snippet}

	<div class="space-y-2">
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
