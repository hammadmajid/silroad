<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import Card from '$lib/components/Card.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>Explore | Silroad</title>
</svelte:head>

<div class="space-y-16">
	<header class="space-y-4 text-center">
		<h1 class="h1">Explore</h1>
		<p class="text-surface-600-300 text-lg">Find events and organizations near you</p>
	</header>

	<section class="space-y-8">
		<header class="flex items-center justify-between">
			<div class="space-y-2">
				<h2 class="h2">Upcoming Events</h2>
				<p class="text-surface-600-300">Discover exciting events happening around you</p>
			</div>
			<a
				href="/explore/events"
				class="btn preset-outlined-primary-500 transition-all duration-200 hover:preset-filled-primary-500"
			>
				View all events
			</a>
		</header>

		{#await data.events}
			<Loading text="Loading events..." />
		{:then events}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each events as event (event.id)}
					<EventCard event={event} />
				{/each}
			</div>
		{:catch error}
			<Alert type="error" title="Failed to load events">
				{error.message}
			</Alert>
		{/await}
	</section>

	<section class="space-y-8">
		<header class="flex items-center justify-between">
			<div class="space-y-2">
				<h2 class="h2">Featured Organizations</h2>
				<p class="text-surface-600-300">Connect with organizations making a difference</p>
			</div>
			<a
				href="/explore/orgs"
				class="btn preset-outlined-primary-500 transition-all duration-200 hover:preset-filled-primary-500"
			>
				View all organizations
			</a>
		</header>

		{#await data.orgs}
			<Loading text="Loading organizations..." />
		{:then orgs}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each orgs as org (org.id)}
					<Card variant="interactive" href="/explore/orgs/{org.slug}" data-testid="org-card">
						{#snippet header()}
							<img
								src={org.avatar}
								alt={org.description}
								class="aspect-[21/9] w-full rounded-lg object-cover"
							/>
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
				{/each}
			</div>
		{:catch error}
			<Alert type="error" title="Failed to load organizations">
				{error.message}
			</Alert>
		{/await}
	</section>
</div>
