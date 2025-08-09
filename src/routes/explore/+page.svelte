<script lang="ts">
	import { ProgressRing } from '@skeletonlabs/skeleton-svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Explore | Silroad</title>
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	<!-- Hero Section -->
	<div class="mb-12 text-center">
		<h1 class="h1 mb-4">Explore</h1>
		<p class="text-lg opacity-80">Find events and organizations near you</p>
	</div>

	<!-- Events Section -->
	<section class="mb-16">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h2 class="h2 mb-2">Upcoming Events</h2>
				<p class="opacity-70">Discover exciting events happening around you</p>
			</div>
			<a
				href="/explore/events"
				class="btn preset-outlined-primary-500 hover:preset-filled-primary-500 transition-all duration-200"
			>
				View all events
			</a>
		</div>

		{#await data.events}
			<div class="flex justify-center py-12">
				<ProgressRing
					value={null}
					size="size-14"
					meterStroke="stroke-tertiary-600-400"
					trackStroke="stroke-tertiary-50-950"
				/>
			</div>
		{:then events}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each events as event}
					<a
						href="/event/{event.id}"
						class="block max-w-md divide-y divide-surface-200-800 overflow-hidden card border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover transition-all duration-200 hover:scale-105"
					>
						<!-- Header -->
						<header>
							<img
								src={event.image}
								alt={event.description}
								class="aspect-[21/9] w-full object-cover"
							/>
						</header>
						<!-- Article -->
						<article class="space-y-4 p-4">
							<div>
								<h2 class="h6 text-primary-500">Event</h2>
								<h3 class="h3">{event.title}</h3>
							</div>
							<p class="opacity-60">
								{event.description}
							</p>
						</article>
						<!-- Footer -->
						<footer class="flex items-center justify-between gap-4 p-4">
							<small class="opacity-60">Learn more</small>
							<small class="opacity-60">→</small>
						</footer>
					</a>
				{/each}
			</div>
		{:catch error}
			<div class="alert preset-filled-error-500">
				<p>Failed to load events: {error.message}</p>
			</div>
		{/await}
	</section>

	<!-- Organizations Section -->
	<section class="mb-16">
		<div class="mb-8 flex items-center justify-between">
			<div>
				<h2 class="h2 mb-2">Featured Organizations</h2>
				<p class="opacity-70">Connect with organizations making a difference</p>
			</div>
			<a
				href="/explore/orgs"
				class="btn preset-outlined-primary-500 hover:preset-filled-primary-500 transition-all duration-200"
			>
				View all organizations
			</a>
		</div>

		{#await data.orgs}
			<div class="flex justify-center py-12">
				<ProgressRing
					value={null}
					size="size-14"
					meterStroke="stroke-tertiary-600-400"
					trackStroke="stroke-tertiary-50-950"
				/>
			</div>
		{:then orgs}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each orgs as org}
					<a
						href="/org/{org.slug}"
						class="block max-w-md divide-y divide-surface-200-800 overflow-hidden card border-[1px] border-surface-200-800 preset-filled-surface-100-900 card-hover transition-all duration-200 hover:scale-105"
					>
						<!-- Header -->
						<header>
							<img src={org.avatar} alt={org.description} class="aspect-[21/9] w-full object-cover" />
						</header>
						<!-- Article -->
						<article class="space-y-4 p-4">
							<div>
								<h2 class="h6 text-primary-500">Organization</h2>
								<h3 class="h3">{org.name}</h3>
							</div>
							<p class="opacity-60">
								{org.description}
							</p>
						</article>
						<!-- Footer -->
						<footer class="flex items-center justify-between gap-4 p-4">
							<small class="opacity-60">Learn more</small>
							<small class="opacity-60">→</small>
						</footer>
					</a>
				{/each}
			</div>
		{:catch error}
			<div class="alert preset-filled-error-500">
				<p>Failed to load organizations: {error.message}</p>
			</div>
		{/await}
	</section>
</div>
