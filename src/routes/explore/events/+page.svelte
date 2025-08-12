<script lang="ts">
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import Card from '$lib/components/Card.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	// Icons
	import IconArrowLeft from '@lucide/svelte/icons/arrow-left';
	import IconArrowRight from '@lucide/svelte/icons/arrow-right';
	import IconEllipsis from '@lucide/svelte/icons/ellipsis';
	import IconFirst from '@lucide/svelte/icons/chevrons-left';
	import IconLast from '@lucide/svelte/icons/chevron-right';

	let { data } = $props();

	function handlePageChange(event: { page: number }) {
		const url = new URL($page.url);
		url.searchParams.set('page', event.page.toString());
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Events | Silroad</title>
</svelte:head>

<div class="space-y-12">
	<header class="space-y-4 text-center">
		<h1 class="h1">All Events</h1>
		<p class="text-surface-600-300 text-lg">Discover all exciting events happening around you</p>
	</header>

	<section class="space-y-8">
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.events as event (event.id)}
				<Card variant="interactive" href="/explore/events/{event.slug}" padding={false}>
					{#snippet header()}
						<img
							src={event.image}
							alt={event.description}
							class="aspect-[21/9] w-full object-cover"
						/>
					{/snippet}

					<div class="space-y-2">
						<h2 class="h6 text-primary-500">Event</h2>
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
			{/each}
		</div>

		{#if data.events.length === 0}
			<div class="py-12 text-center">
				<p class="text-surface-600-300 text-lg">No events found.</p>
			</div>
		{/if}
	</section>

	{#if data.pagination.totalPages > 1}
		<footer class="flex justify-center">
			<Pagination
				data={Array(data.pagination.totalCount).fill({})}
				page={data.pagination.page}
				onPageChange={handlePageChange}
				pageSize={data.pagination.pageSize}
				siblingCount={4}
			>
				{#snippet labelEllipsis()}<IconEllipsis class="size-4" />{/snippet}
				{#snippet labelNext()}<IconArrowRight class="size-4" />{/snippet}
				{#snippet labelPrevious()}<IconArrowLeft class="size-4" />{/snippet}
				{#snippet labelFirst()}<IconFirst class="size-4" />{/snippet}
				{#snippet labelLast()}<IconLast class="size-4" />{/snippet}
			</Pagination>
		</footer>
	{/if}
</div>
