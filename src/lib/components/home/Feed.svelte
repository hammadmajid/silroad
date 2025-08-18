<script lang="ts">
	import type { Event } from '$lib/types';
	import Loading from '$lib/components/Loading.svelte';
	import Card from '$lib/components/Card.svelte';

	interface Props {
		attendingEvents: Promise<Event[]> | null;
		pastAttendedEvents: Promise<Event[]> | null;
	}

	let { attendingEvents, pastAttendedEvents }: Props = $props();
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

		{#if attendingEvents}
			{#await attendingEvents}
				<div class="grid gap-4">
					<Loading />
				</div>
			{:then events}
				{#if events.length > 0}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event}
							<Card
								variant="interactive"
								href="/explore/events/{event.slug}"
								data-testid="event-card"
							>
								{#snippet header()}
									<img
										src={event.image}
										alt={event.description}
										class="aspect-[21/9] w-full rounded-lg object-cover"
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
				{:else}
					<div class="py-8 text-center">
						<p class="text-surface-500">You're not attending any upcoming events.</p>
						<a href="/explore/events" class="variant-filled-primary mt-4 btn"> Explore Events </a>
					</div>
				{/if}
			{:catch error}
				<div class="py-4 text-center text-error-500">Failed to load upcoming events.</div>
			{/await}
		{:else}
			<div class="py-8 text-center">
				<p class="text-surface-500">You're not attending any upcoming events.</p>
				<a href="/explore/events" class="variant-filled-primary mt-4 btn"> Explore Events </a>
			</div>
		{/if}
	</section>

	<!-- Section 3: Past events user attended -->
	<section class="space-y-4">
		<h2 class="h2">Past Events</h2>

		{#if pastAttendedEvents}
			{#await pastAttendedEvents}
				<div class="grid gap-4">
					<Loading />
				</div>
			{:then events}
				{#if events.length > 0}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each events as event}
							<Card
								variant="interactive"
								href="/explore/events/{event.slug}"
								data-testid="event-card"
							>
								{#snippet header()}
									<img
										src={event.image}
										alt={event.description}
										class="aspect-[21/9] w-full rounded-lg object-cover"
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
				{:else}
					<div class="py-8 text-center">
						<p class="text-surface-500">You haven't attended any events yet.</p>
					</div>
				{/if}
			{:catch error}
				<div class="py-4 text-center text-error-500">Failed to load past events.</div>
			{/await}
		{:else}
			<div class="py-8 text-center">
				<p class="text-surface-500">You haven't attended any events yet.</p>
			</div>
		{/if}
	</section>

	<!-- Section 4: Call to action for organizations -->
	<section class="border-t border-surface-300-700 py-12 text-center">
		<div class="space-y-4">
			<h3 class="h3">Want to host your own events?</h3>
			<p class="text-surface-600-300">Create your own organization to start hosting events.</p>
			<a href="/explore/orgs" class="btn preset-filled-secondary-50-950"> Explore Organizations </a>
		</div>
	</section>
</div>
