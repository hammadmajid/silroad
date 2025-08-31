<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import OrgCard from '$lib/components/OrgCard.svelte';
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
					<EventCard {event} />
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
					<OrgCard {org} />
				{/each}
			</div>
		{:catch error}
			<Alert type="error" title="Failed to load organizations">
				{error.message}
			</Alert>
		{/await}
	</section>
</div>
