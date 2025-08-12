<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	let { data } = $props();

	const { event, attendeeCount, organizers } = data;

	// Format date for display
	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	// Check if RSVP is still open
	const isRsvpOpen = event.closeRsvpAt ? new Date(event.closeRsvpAt) > new Date() : true;
	const isEventFull = event.maxAttendees ? attendeeCount >= event.maxAttendees : false;

	const handleRsvp = () => {
		// TODO: Implement RSVP functionality
		alert('RSVP functionality coming soon!');
	};
</script>

<svelte:head>
	<title>{event.title} | Silroad</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<!-- Back Navigation -->
	<nav class="mb-6">
		<a href="/explore" class="btn preset-outlined-surface-500 hover:preset-filled-surface-500">
			← Back to Explore
		</a>
	</nav>

	<!-- Event Hero -->
	<div class="mb-8">
		{#if event.image}
			<img
				src={event.image}
				alt={event.title}
				class="mb-6 aspect-[21/9] w-full rounded-lg object-cover"
			/>
		{/if}

		<div class="mb-4">
			<span class="mb-2 badge preset-filled-primary-500">Event</span>
			<h1 class="h1">{event.title}</h1>
		</div>

		<div class="mb-6 flex flex-wrap gap-4 text-sm opacity-70">
			<div class="flex items-center gap-2">
				<span>📅</span>
				<span>{formatDate(new Date(event.dateOfEvent).getTime())}</span>
			</div>
			{#if event.maxAttendees}
				<div class="flex items-center gap-2">
					<span>👥</span>
					<span>{attendeeCount}/{event.maxAttendees} attendees</span>
				</div>
			{:else}
				<div class="flex items-center gap-2">
					<span>👥</span>
					<span>{attendeeCount} attendees</span>
				</div>
			{/if}
			{#if event.closeRsvpAt}
				<div class="flex items-center gap-2">
					<span>🕒</span>
					<span>RSVP closes {formatDate(new Date(event.closeRsvpAt).getTime())}</span>
				</div>
			{/if}
		</div>

		<!-- RSVP Button -->
		<div class="mb-8">
			{#if isEventFull}
				<button class="btn preset-filled-surface-500" disabled> Event Full </button>
			{:else if !isRsvpOpen}
				<button class="btn preset-filled-surface-500" disabled> RSVP Closed </button>
			{:else}
				<button class="btn preset-filled-primary-500" onclick={handleRsvp}> RSVP to Event </button>
			{/if}
		</div>
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Main Content -->
		<div class="lg:col-span-2">
			<Card class="mb-6">
				<h2 class="mb-4 h3">About this Event</h2>
				{#if event.description}
					<p class="whitespace-pre-wrap">{event.description}</p>
				{:else}
					<p class="opacity-60">No description provided for this event.</p>
				{/if}
			</Card>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Organization Info -->
			{#if event.organizationName}
				<Card>
					<h3 class="mb-4 h4">Hosted by</h3>
					<a href="/org/{event.organizationSlug}" class="block hover:opacity-80">
						<div class="flex items-center gap-3 overflow-hidden">
							<Avatar
								src={event.organizationAvatar || undefined}
								name={event.organizationName || 'Organization'}
								size="w-12 h-12"
								background="preset-filled-surface-200-800"
							/>
							<div class="min-w-0 flex-1">
								<h4 class="truncate font-semibold">{event.organizationName}</h4>
								<p class="truncate text-sm opacity-60">View organization →</p>
							</div>
						</div>
					</a>
				</Card>
			{/if}

			<!-- Organizers -->
			{#if organizers.length > 0}
				<Card>
					<h3 class="mb-4 h4">Organizers</h3>
					<div class="space-y-3">
						{#each organizers as organizer (organizer.userId)}
							<div class="flex items-center gap-3 overflow-hidden">
								<Avatar
									src={organizer.image || undefined}
									name={organizer.name || 'Organizer'}
									size="w-10 h-10"
									background="preset-filled-surface-200-800"
								/>
								<span class="min-w-0 truncate font-medium">{organizer.name}</span>
							</div>
						{/each}
					</div>
				</Card>
			{/if}

			<!-- Event Stats -->
			<Card>
				<h3 class="mb-4 h4">Event Details</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="opacity-60">Attendees:</span>
						<span>{attendeeCount}{event.maxAttendees ? `/${event.maxAttendees}` : ''}</span>
					</div>
					<div class="flex justify-between">
						<span class="opacity-60">RSVP Status:</span>
						<span class={isRsvpOpen ? 'text-success-500' : 'text-error-500'}>
							{isRsvpOpen ? 'Open' : 'Closed'}
						</span>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>
