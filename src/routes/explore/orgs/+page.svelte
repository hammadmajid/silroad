<script lang="ts">
	import { Pagination } from '@skeletonlabs/skeleton-svelte';
	import OrgCard from '$lib/components/OrgCard.svelte';
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
	<title>Organizations | Silroad</title>
</svelte:head>

<div class="space-y-12">
	<header class="space-y-4 text-center">
		<h1 class="h1">All Organizations</h1>
		<p class="text-surface-600-300 text-lg">Connect with all organizations making a difference</p>
	</header>

	<section class="space-y-8">
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.orgs as org (org.id)}
				<OrgCard {org} />
			{/each}
		</div>

		{#if data.orgs.length === 0}
			<div class="py-12 text-center">
				<p class="text-surface-600-300 text-lg">No organizations found.</p>
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
