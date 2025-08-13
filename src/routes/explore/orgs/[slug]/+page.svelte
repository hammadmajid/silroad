<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import Users from '@lucide/svelte/icons/users';
	import Calendar from '@lucide/svelte/icons/calendar';
	import { userStore } from '$lib/stores/user.svelte';
	import { handleLoginRedirect } from '$lib/utils/redirect';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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
		if (!userStore.isLoggedIn) {
			goto(handleLoginRedirect({ url: $page.url }, 'You must be logged in to join organizations'));
			return;
		}
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

<div class="space-y-8">
	<section class="space-y-6">
		{#if organization.backgroundImage}
			<img
				src={organization.backgroundImage}
				alt={organization.name}
				class="aspect-[21/9] w-full rounded-lg object-cover"
			/>
		{/if}

		<div class="flex flex-col gap-4 sm:flex-row sm:items-start">
			<div class="flex-1 space-y-4">
				<header class="space-y-2">
					<span class="badge preset-filled-primary-500">Organization</span>
					<h1 class="h1">{organization.name}</h1>
				</header>

				<div class="text-surface-600-300 flex flex-wrap gap-4 text-sm">
					<div class="flex items-center gap-2">
						<Users size={16} />
						<span>{memberCount} members</span>
					</div>
					<div class="flex items-center gap-2">
						<Calendar size={16} />
						<span>{events.length} events</span>
					</div>
				</div>

				{#if organization.description}
					<p class="text-surface-600-300 text-lg">{organization.description}</p>
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
		<div>
			<button class="btn preset-filled-primary-500" onclick={handleJoin}>
				Join Organization
			</button>
		</div>
	</section>

	<div class="grid gap-8 lg:grid-cols-3">
		<!-- Main Content -->
		<section class="space-y-6 lg:col-span-2">
			<!-- Upcoming Events -->
			{#if upcomingEvents.length > 0}
				<Card class="space-y-4">
					<header>
						<h2 class="h3">Upcoming Events</h2>
					</header>
					<div class="space-y-4">
						{#each upcomingEvents as event (event.id)}
							<a
								href="/explore/events/{event.slug}"
								class="block rounded border border-surface-200-800 p-4 transition-colors hover:bg-surface-50-950"
							>
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1 space-y-2">
										<h3 class="font-semibold">{event.title}</h3>
										{#if event.description}
											<p class="text-surface-600-300 line-clamp-2 text-sm">{event.description}</p>
										{/if}
										<p class="text-sm text-primary-500">
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
				<Card class="space-y-4">
					<header>
						<h2 class="h3">Past Events</h2>
					</header>
					<div class="space-y-4">
						{#each pastEvents.slice(0, 5) as event (event.id)}
							<a
								href="/explore/events/{event.slug}"
								class="block rounded border border-surface-200-800 p-4 opacity-60 transition-colors hover:bg-surface-50-950"
							>
								<div class="flex items-start justify-between gap-4">
									<div class="flex-1 space-y-2">
										<h3 class="font-semibold">{event.title}</h3>
										{#if event.description}
											<p class="text-surface-600-300 line-clamp-2 text-sm">{event.description}</p>
										{/if}
										<p class="text-surface-600-300 text-sm">
											{formatDate(new Date(event.dateOfEvent).getTime())}
										</p>
									</div>
									{#if event.image}
										<img src={event.image} alt={event.title} class="size-16 rounded object-cover" />
									{/if}
								</div>
							</a>
						{/each}
						{#if pastEvents.length > 5}
							<p class="text-surface-600-300 text-center text-sm">
								and {pastEvents.length - 5} more past events...
							</p>
						{/if}
					</div>
				</Card>
			{/if}

			{#if events.length === 0}
				<Card>
					<div class="py-8 text-center">
						<p class="text-surface-600-300">This organization hasn't hosted any events yet.</p>
					</div>
				</Card>
			{/if}
		</section>

		<!-- Sidebar -->
		<aside class="space-y-6">
			<!-- Organization Stats -->
			<Card class="space-y-4">
				<header>
					<h3 class="h4">Organization Stats</h3>
				</header>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-surface-600-300">Members:</span>
						<span>{memberCount}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-surface-600-300">Total Events:</span>
						<span>{events.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-surface-600-300">Upcoming Events:</span>
						<span>{upcomingEvents.length}</span>
					</div>
				</div>
			</Card>

			<!-- Members Preview -->
			{#if members.length > 0}
				<Card class="space-y-4">
					<header>
						<h3 class="h4">Members</h3>
					</header>
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
							<p class="text-surface-600-300 text-sm">
								and {memberCount - members.length} more members...
							</p>
						{/if}
					</div>
				</Card>
			{/if}

			<!-- Organization Details -->
			<Card class="space-y-4">
				<header>
					<h3 class="h4">About</h3>
				</header>
				{#if organization.description}
					<p class="text-sm whitespace-pre-wrap">{organization.description}</p>
				{:else}
					<p class="text-surface-600-300 text-sm">No description provided for this organization.</p>
				{/if}
			</Card>
		</aside>
	</div>
</div>
