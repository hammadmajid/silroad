<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	let { data } = $props();

	const { organization, events, memberCount, members } = data;

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

	const handleJoin = () => {
		// TODO: Implement join functionality
		alert('Join functionality coming soon!');
	};

	// Separate upcoming and past events
	const now = Date.now();
	const upcomingEvents = events.filter((event) => new Date(event.dateOfEvent).getTime() > now);
	const pastEvents = events.filter((event) => new Date(event.dateOfEvent).getTime() <= now);
</script>

<svelte:head>
	<title>{organization.name} | Silroad</title>
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 py-8">
	<!-- Back Navigation -->
	<nav class="mb-6">
		<a href="/explore" class="btn preset-outlined-surface-500 hover:preset-filled-surface-500">
			← Back to Explore
		</a>
	</nav>

	<!-- Organization Hero -->
	<div class="mb-8">
		{#if organization.backgroundImage}
			<img
				src={organization.backgroundImage}
				alt={organization.name}
				class="mb-6 aspect-[21/9] w-full rounded-lg object-cover"
			/>
		{/if}

		<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
			<div class="flex-1">
				<div class="mb-4">
					<span class="mb-2 badge preset-filled-primary-500">Organization</span>
					<h1 class="h1">{organization.name}</h1>
				</div>

				<div class="mb-4 flex flex-wrap gap-4 text-sm opacity-70">
					<div class="flex items-center gap-2">
						<span>👥</span>
						<span>{memberCount} members</span>
					</div>
					<div class="flex items-center gap-2">
						<span>📅</span>
						<span>{events.length} events</span>
					</div>
				</div>

				{#if organization.description}
					<p class="mb-6 text-lg opacity-80">{organization.description}</p>
				{/if}
			</div>

			<Avatar
				src={organization.avatar || undefined}
				name={organization.name}
				size="w-24 h-24 sm:w-32 sm:h-32"
				background="preset-filled-surface-200-800"
			/>
		</div>

		<!-- Join Button -->
		<div class="mb-8">
			<button class="btn preset-filled-primary-500" onclick={handleJoin}>
				Join Organization
			</button>
		</div>
	</div>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Main Content -->
		<div class="lg:col-span-2">
			<!-- Upcoming Events -->
			{#if upcomingEvents.length > 0}
				<Card class="mb-6">
					<h2 class="mb-4 h3">Upcoming Events</h2>
					<div class="space-y-4">
						{#each upcomingEvents as event (event.id)}
							<a
								href="/event/{event.slug}"
								class="block rounded border border-surface-200-800 p-4 transition-colors hover:bg-surface-50-950"
							>
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1">
										<h3 class="font-semibold">{event.title}</h3>
										{#if event.description}
											<p class="mt-1 line-clamp-2 text-sm opacity-60">{event.description}</p>
										{/if}
										<p class="mt-2 text-sm text-primary-500">
											{formatDate(new Date(event.dateOfEvent).getTime())}
										</p>
									</div>
									{#if event.image}
										<img src={event.image} alt={event.title} class="size-16 rounded object-cover" />
									{/if}
								</div>
							</a>
						{/each}
					</div>
				</Card>
			{/if}

			<!-- Past Events -->
			{#if pastEvents.length > 0}
				<Card class="mb-6">
					<h2 class="mb-4 h3">Past Events</h2>
					<div class="space-y-4">
						{#each pastEvents.slice(0, 5) as event (event.id)}
							<a
								href="/event/{event.slug}"
								class="block rounded border border-surface-200-800 p-4 opacity-60 transition-colors hover:bg-surface-50-950"
							>
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1">
										<h3 class="font-semibold">{event.title}</h3>
										{#if event.description}
											<p class="mt-1 line-clamp-2 text-sm opacity-60">{event.description}</p>
										{/if}
										<p class="mt-2 text-sm">{formatDate(new Date(event.dateOfEvent).getTime())}</p>
									</div>
									{#if event.image}
										<img src={event.image} alt={event.title} class="size-16 rounded object-cover" />
									{/if}
								</div>
							</a>
						{/each}
						{#if pastEvents.length > 5}
							<p class="text-center text-sm opacity-60">
								and {pastEvents.length - 5} more past events...
							</p>
						{/if}
					</div>
				</Card>
			{/if}

			{#if events.length === 0}
				<Card>
					<div class="py-8 text-center">
						<p class="opacity-60">This organization hasn't hosted any events yet.</p>
					</div>
				</Card>
			{/if}
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Organization Stats -->
			<Card>
				<h3 class="mb-4 h4">Organization Stats</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="opacity-60">Members:</span>
						<span>{memberCount}</span>
					</div>
					<div class="flex justify-between">
						<span class="opacity-60">Total Events:</span>
						<span>{events.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="opacity-60">Upcoming Events:</span>
						<span>{upcomingEvents.length}</span>
					</div>
				</div>
			</Card>

			<!-- Members Preview -->
			{#if members.length > 0}
				<Card>
					<h3 class="mb-4 h4">Members</h3>
					<div class="space-y-3">
						{#each members as member (member.userId)}
							<div class="flex items-center gap-3 overflow-hidden">
								<Avatar
									src={member.image || undefined}
									name={member.name || 'Member'}
									size="w-10 h-10"
									background="preset-filled-surface-200-800"
								/>
								<span class="min-w-0 flex-1 truncate font-medium">{member.name}</span>
							</div>
						{/each}
						{#if memberCount > members.length}
							<p class="text-sm opacity-60">
								and {memberCount - members.length} more members...
							</p>
						{/if}
					</div>
				</Card>
			{/if}

			<!-- Organization Details -->
			<Card>
				<h3 class="mb-4 h4">About</h3>
				{#if organization.description}
					<p class="text-sm whitespace-pre-wrap">{organization.description}</p>
				{:else}
					<p class="text-sm opacity-60">No description provided for this organization.</p>
				{/if}
			</Card>
		</div>
	</div>
</div>
