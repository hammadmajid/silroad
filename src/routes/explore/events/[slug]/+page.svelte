<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Users from '@lucide/svelte/icons/users';
	import Clock from '@lucide/svelte/icons/clock';
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

<div class="space-y-8">
	<section class="space-y-6">
		{#if event.image}
			<img
				src={event.image}
				alt={event.title}
				class="aspect-[21/9] w-full rounded-lg object-cover"
			/>
		{/if}

		<header class="space-y-4">
			<div class="space-y-2">
				<Badge variant="filled" color="primary">Event</Badge>
				<h1 class="h1">{event.title}</h1>
			</div>

			<div class="text-surface-600-300 flex flex-wrap gap-4 text-sm">
				<div class="flex items-center gap-2">
					<Calendar size={16} />
					<span>{formatDate(new Date(event.dateOfEvent).getTime())}</span>
				</div>
				{#if event.maxAttendees}
					<div class="flex items-center gap-2">
						<Users size={16} />
						<span>{attendeeCount}/{event.maxAttendees} attendees</span>
					</div>
				{:else}
					<div class="flex items-center gap-2">
						<Users size={16} />
						<span>{attendeeCount} attendees</span>
					</div>
				{/if}
				{#if event.closeRsvpAt}
					<div class="flex items-center gap-2">
						<Clock size={16} />
						<span>RSVP closes {formatDate(new Date(event.closeRsvpAt).getTime())}</span>
					</div>
				{/if}
			</div>
		</header>

		<!-- RSVP Button -->
		<div>
			{#if isEventFull}
				<button class="btn preset-filled-surface-500" disabled> Event Full </button>
			{:else if !isRsvpOpen}
				<button class="btn preset-filled-surface-500" disabled> RSVP Closed </button>
			{:else}
				<button class="btn preset-filled-primary-500" onclick={handleRsvp}> RSVP to Event </button>
			{/if}
		</div>
	</section>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Main Content -->
		<section class="space-y-6 lg:col-span-2">
			<Card class="space-y-4">
				<header>
					<h2 class="h3">About this Event</h2>
				</header>
				{#if event.description}
					<p class="whitespace-pre-wrap">{event.description}</p>
				{:else}
					<p class="text-surface-600-300">No description provided for this event.</p>
				{/if}
			</Card>
		</section>

		<!-- Sidebar -->
		<aside class="space-y-6">
			<!-- Organization Info -->
			{#if event.organizationName}
				<Card class="space-y-4">
					<header>
						<h3 class="h4">Hosted by</h3>
					</header>
					<a href="/explore/orgs/{event.organizationSlug}" class="block hover:opacity-80">
						<div class="flex items-center gap-3 overflow-hidden">
							<Avatar
								src={event.organizationAvatar || undefined}
								name={event.organizationName || 'Organization'}
								size="w-12 h-12"
								background="preset-filled-surface-200-800"
							/>
							<div class="min-w-0 flex-1 space-y-1">
								<h4 class="truncate font-semibold">{event.organizationName}</h4>
								<p class="text-surface-600-300 truncate text-sm">View organization →</p>
							</div>
						</div>
					</a>
				</Card>
			{/if}

			<!-- Organizers -->
			{#if organizers.length > 0}
				<Card class="space-y-4">
					<header>
						<h3 class="h4">Organizers</h3>
					</header>
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
			<Card class="space-y-4">
				<header>
					<h3 class="h4">Event Details</h3>
				</header>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-surface-600-300">Attendees:</span>
						<span>{attendeeCount}{event.maxAttendees ? `/${event.maxAttendees}` : ''}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-surface-600-300">RSVP Status:</span>
						<span class={isRsvpOpen ? 'text-success-500' : 'text-error-500'}>
							{isRsvpOpen ? 'Open' : 'Closed'}
						</span>
					</div>
				</div>
			</Card>
		</aside>
	</div>
</div>
