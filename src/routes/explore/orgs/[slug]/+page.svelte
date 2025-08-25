<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { Avatar } from '@skeletonlabs/skeleton-svelte';
	import Users from '@lucide/svelte/icons/users';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Plus from '@lucide/svelte/icons/plus';
	import Check from '@lucide/svelte/icons/check';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { enhance } from '$app/forms';

	let { data } = $props();

	const { organization, events, memberCount, members, isFollowing } = data;

	// Create local reactive states
	let localIsFollowing = $derived(isFollowing);
	let isSubmitting = $state(false);

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

	// Separate upcoming and past events
	const now = Date.now();
	const upcomingEvents = events.filter((event) => new Date(event.dateOfEvent).getTime() > now);
	const pastEvents = events.filter((event) => new Date(event.dateOfEvent).getTime() <= now);
</script>

<svelte:head>
	<title>{organization.name} | Silroad</title>
</svelte:head>

<div class="space-y-8">
	<section class="relative">
		{#if organization.backgroundImage}
			<img
				src={organization.backgroundImage}
				alt={organization.name}
				class="h-48 w-full rounded-lg object-cover"
			/>
		{/if}

		<!-- Avatar overlapping header -->
		<div class="absolute right-4 -bottom-12">
			<Avatar
				src={organization.avatar || undefined}
				name={organization.name}
				size="w-24 h-24 sm:w-32 sm:h-32"
				background="preset-filled-surface-200-800"
			/>
		</div>
	</section>

	<!-- Organization details under avatar -->
	<section class="mt-16 space-y-6 px-4">
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

		<form
			action="?/toggleFollow"
			method="POST"
			use:enhance={() => {
				// Optimistically update the UI immediately
				localIsFollowing = !localIsFollowing;
				isSubmitting = true;

				return async ({ result, update }) => {
					isSubmitting = false;
					if (result.type === 'success') {
						// Update was successful, keep the optimistic state
						await update();
					} else if (result.type === 'redirect') {
						// Handle redirect (e.g., login redirect)
						await update(); // This will perform the redirect
					} else {
						// Revert on error
						localIsFollowing = !localIsFollowing;
					}
				};
			}}
		>
			<input type="hidden" name="organizationId" value={organization.id} />
			<button
				type="submit"
				class="btn flex items-center justify-center gap-2 preset-filled-primary-500"
				disabled={isSubmitting}
				data-testid="follow-toggle-btn"
			>
				{#if isSubmitting}
					<Loader2 class="animate-spin" />
					<span> Loading... </span>
				{:else if localIsFollowing}
					<Check />
					<span> Unfollow </span>
				{:else}
					<Plus />
					<span> Follow </span>
				{/if}
			</button>
		</form>
	</section>

	<div class="grid gap-8 px-4 lg:grid-cols-3">
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
						{#each members as member (member.id)}
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
