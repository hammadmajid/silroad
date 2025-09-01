<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import OrgCard from '$lib/components/OrgCard.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import Badge from '$lib/components/Badge.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Organization - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-6 h2">Organization</h1>

		<div class="space-y-6">
			<!-- Owned Organization -->
			{#if data.ownedOrganization}
				<div>
					<div class="mb-4 flex items-center gap-2">
						<h2 class="h3">Your Organization</h2>
						<Badge>Owner</Badge>
					</div>
					<div class="space-y-4">
						<p class="text-surface-600-300-token">Manage your organization settings and members.</p>
						<div class="border-surface-300-600-token rounded-lg border p-4">
							<div class="flex items-start justify-between">
								<div class="flex items-center gap-4">
									{#if data.ownedOrganization.avatar}
										<img
											src={data.ownedOrganization.avatar}
											alt="{data.ownedOrganization.name} avatar"
											class="size-12 rounded-lg object-cover"
										/>
									{:else}
										<div
											class="bg-surface-300-600-token flex size-12 items-center justify-center rounded-lg"
										>
											<span class="text-lg font-semibold">
												{data.ownedOrganization.name.charAt(0).toUpperCase()}
											</span>
										</div>
									{/if}
									<div>
										<h3 class="text-lg font-semibold">{data.ownedOrganization.name}</h3>
										<p class="text-surface-600-300-token text-sm">@{data.ownedOrganization.slug}</p>
										{#if data.ownedOrganization.description}
											<p class="text-surface-600-300-token mt-1 text-sm">
												{data.ownedOrganization.description}
											</p>
										{/if}
									</div>
								</div>
								<div class="flex gap-2">
									<a
										href="/org/{data.ownedOrganization.slug}"
										class="btn preset-outlined-surface-500"
									>
										View Profile
									</a>
									<a href="/settings/organization/edit" class="btn preset-filled-primary-500">
										Edit Organization
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<!-- Create Organization -->
				<div>
					<h2 class="mb-4 h4">Create Organization</h2>
					<div class="space-y-4">
						<p class="text-surface-600-300-token">
							Organizations help you collaborate with team members and host events together.
						</p>
						<a href="/settings/organization/create" class="btn preset-filled-primary-500">
							Create New Organization
						</a>
					</div>
				</div>
			{/if}

			<!-- Member Organizations -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h4">Organizations You're a Member Of</h2>
				<div class="space-y-4">
					{#if data.userOrganizations.length > 0}
						<div class="grid gap-4 sm:grid-cols-2">
							{#each data.userOrganizations as org (org.id)}
								<OrgCard {org} />
							{/each}
						</div>
					{:else}
						<div class="border-surface-300-600-token rounded-lg border p-6">
							<div class="text-center">
								<p class="text-surface-600-300-token mb-2">
									You're not a member of any organizations yet.
								</p>
								<p class="text-surface-600-300-token text-sm">
									Join organizations to collaborate and participate in their events.
								</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Quick Actions -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h5">Quick Actions</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<a
						href="/explore/orgs"
						class="border-surface-300-600-token hover:bg-surface-100-800-token rounded-lg border p-4 transition-colors"
					>
						<h3 class="mb-2 font-semibold">Discover Organizations</h3>
						<p class="text-surface-600-300-token text-sm">
							Find and join organizations that match your interests.
						</p>
					</a>

					{#if data.ownedOrganization}
						<a
							href="/settings/organization/members"
							class="border-surface-300-600-token hover:bg-surface-100-800-token rounded-lg border p-4 transition-colors"
						>
							<h3 class="mb-2 font-semibold">Manage Members</h3>
							<p class="text-surface-600-300-token text-sm">
								Add or remove members from your organization.
							</p>
						</a>

						<a
							href="/settings/organization/events"
							class="border-surface-300-600-token hover:bg-surface-100-800-token rounded-lg border p-4 transition-colors"
						>
							<h3 class="mb-2 font-semibold">Manage Events</h3>
							<p class="text-surface-600-300-token text-sm">
								Create and manage events for your organization.
							</p>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</Card>
</div>
