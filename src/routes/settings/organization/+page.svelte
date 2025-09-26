<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import OrgCard from '$lib/components/OrgCard.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { getPlanConfig } from '$lib/utils/plans';

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
										href="/orgs/{data.ownedOrganization.slug}"
										class="btn preset-outlined-surface-500"
									>
										View Profile
									</a>
									<a href="/manage/edit" class="btn preset-filled-primary-500">
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
						{#if data.canCreateOrganization}
							<p class="text-surface-600-300-token">
								Organizations help you collaborate with team members and host events together.
							</p>
							<a href="/manage/org/create" class="btn preset-filled-primary-500">
								Create New Organization
							</a>
						{:else}
							<!-- Paywall for free users -->
							<div
								class="rounded-lg border border-warning-500 bg-warning-50 p-6 dark:bg-warning-900/20"
							>
								<div class="mb-4 flex items-start gap-4">
									<div class="rounded-full bg-warning-100 p-2 dark:bg-warning-900/40">
										<svg
											class="size-5 text-warning-600 dark:text-warning-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
											/>
										</svg>
									</div>
									<div class="flex-1">
										<h3 class="mb-2 font-semibold text-warning-800 dark:text-warning-200">
											Premium Feature
										</h3>
										<p class="mb-4 text-warning-700 dark:text-warning-300">
											Creating organizations is a premium feature. Upgrade to unlock the ability to
											create and manage your own organizations.
										</p>
										<div class="mb-4 space-y-2">
											<p class="text-sm font-medium text-warning-700 dark:text-warning-300">
												Premium includes:
											</p>
											<ul class="ml-4 space-y-1 text-sm text-warning-600 dark:text-warning-400">
												{#each getPlanConfig('premium').features as feature}
													<li class="flex items-center gap-2">
														<svg
															class="size-4 flex-shrink-0"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																d="M5 13l4 4L19 7"
															/>
														</svg>
														{feature}
													</li>
												{/each}
											</ul>
										</div>
										<div class="flex flex-wrap gap-3">
											<a href="/settings/payment" class="btn preset-filled-primary-500">
												Upgrade to Premium
											</a>
											<a href="/explore/orgs" class="btn preset-outlined">
												Explore Organizations
											</a>
										</div>
									</div>
								</div>
							</div>
						{/if}
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
							href="/manage/members"
							class="border-surface-300-600-token hover:bg-surface-100-800-token rounded-lg border p-4 transition-colors"
						>
							<h3 class="mb-2 font-semibold">Manage Members</h3>
							<p class="text-surface-600-300-token text-sm">
								Add or remove members from your organization.
							</p>
						</a>

						<a
							href="/manage/event/create"
							class="border-surface-300-600-token hover:bg-surface-100-800-token rounded-lg border p-4 transition-colors"
						>
							<h3 class="mb-2 font-semibold">Create Event</h3>
							<p class="text-surface-600-300-token text-sm">Create events for your organization.</p>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</Card>
</div>
