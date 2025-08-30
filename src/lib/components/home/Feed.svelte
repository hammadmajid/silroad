<script lang="ts">
	import type { Event } from '$lib/types';
	import Loading from '$lib/components/Loading.svelte';
	import EventCard from '../EventCard.svelte';

	interface Props {
		attendingEvents: Promise<Event[]> | null;
		pastAttendedEvents: Promise<Event[]> | null;
		followedOrgsEvents: Promise<Event[]> | null;
	}

	let { attendingEvents, pastAttendedEvents, followedOrgsEvents }: Props = $props();
</script>

<div class="space-y-16">
	<!-- Section 1: Main header -->
	<header class="space-y-4 text-center">
		<h1 class="h1">
			{#if new Date().getHours() < 12}
				Good Morning
			{:else if new Date().getHours() < 18}
				Good Afternoon
			{:else}
				Good Evening
			{/if}
		</h1>
		<p class="text-surface-600-300 text-lg">Welcome back to Silroad</p>
	</header>

	<!-- Section 2: Upcoming events user is attending -->
	<section class="space-y-4">
		<h2 class="h2">Your Upcoming Events</h2>
		<p class="text-surface-600-300">Events you've RSVP'd to attend</p>

		{#if attendingEvents}
			{#await attendingEvents}
				<div class="grid gap-4">
					<Loading />
				</div>
			{:then events}
				{#if events.length > 0}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event (event.id)}
							<EventCard event={event} />
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center">
						<p class="text-surface-500">You're not attending any upcoming events</p>
						<a href="/explore/events" class="variant-filled-primary mt-4 btn"> Explore Events </a>
					</div>
				{/if}
			{:catch err}
				<div class="py-4 text-center text-error-500">Failed to load upcoming events.</div>
			{/await}
		{:else}
			<div class="py-8 text-center">
				<p class="text-surface-500">You're not attending any upcoming events</p>
				<a href="/explore/events" class="variant-filled-primary mt-4 btn"> Explore Events </a>
			</div>
		{/if}
	</section>

	<!-- Section 3: Events from followed organizations -->
	<section class="space-y-4" data-testid="recommended-section">
		<h2 class="h2">Recommended</h2>
		<p class="text-surface-600-300">Events from organizations you follow</p>

		{#if followedOrgsEvents}
			{#await followedOrgsEvents}
				<div class="grid gap-4">
					<Loading />
				</div>
			{:then events}
				{#if events.length > 0}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event (event.id)}
							<EventCard event={event} />
						{/each}
					</div>
				{:else}
					<div class="space-y-2 py-8 text-center">
						<p class="text-surface-600-300">No events from organizations you follow</p>
						<a href="/explore/orgs" class="btn preset-filled-secondary-50-950">
							Explore Organizations
						</a>
					</div>
				{/if}
			{:catch err}
				<div class="py-4 text-center text-error-500">
					Failed to load events from followed organizations.
				</div>
			{/await}
		{:else}
			<div class="space-y-2 py-8 text-center">
				<p class="text-surface-600-300">No events from organizations you follow</p>
				<a href="/explore/orgs" class="btn preset-filled-secondary-50-950">
					Explore Organizations
				</a>
			</div>
		{/if}
	</section>

	<!-- Section 4: Past events user attended -->
	<section class="space-y-4">
		<h2 class="h2">Past Events</h2>
		<p class="text-surface-600-300">Events you've previously attended</p>

		{#if pastAttendedEvents}
			{#await pastAttendedEvents}
				<div class="grid gap-4">
					<Loading />
				</div>
			{:then events}
				{#if events.length > 0}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event (event.id)}
							<EventCard event={event} />
						{/each}
					</div>
				{:else}
					<div class="py-8 text-center">
						<p class="text-surface-500">You haven't attended any events yet.</p>
					</div>
				{/if}
			{:catch err}
				<div class="py-4 text-center text-error-500">Failed to load past events.</div>
			{/await}
		{:else}
			<div class="py-8 text-center">
				<p class="text-surface-500">You haven't attended any events yet.</p>
			</div>
		{/if}
	</section>

	<!-- Section 5: Call to action for organizations -->
	<!-- TODO: Show data and actions for user's organization if it exists -->
	<section class="border-t border-surface-300-700 py-12 text-center">
		<div class="space-y-4">
			<h3 class="h3">Want to host your own events?</h3>
			<p class="text-surface-600-300">Create your own organization to start hosting events.</p>
			<a href="/settings/organization" class="btn preset-filled-secondary-50-950">
				Create Organization
			</a>
		</div>
	</section>
</div>
