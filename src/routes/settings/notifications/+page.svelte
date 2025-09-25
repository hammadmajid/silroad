<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	let securityAlerts = $state(true);
	let upcomingEvents = $state(true);
</script>

<svelte:head>
	<title>Notifications - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-6 h2">Notifications</h1>

		<div class="space-y-6">
			<!-- Email Notifications -->
			<div>
				<h2 class="mb-4 h3">Email Notifications</h2>
				<div class="space-y-4">
					<label class="flex cursor-not-allowed items-center gap-3 opacity-50">
						<input type="checkbox" checked={securityAlerts} disabled class="checkbox" />
						<div>
							<div class="font-medium">Security alerts</div>
							<div class="text-surface-600-300-token text-sm">
								Get notified about security-related events
							</div>
						</div>
					</label>

					<label class="flex cursor-not-allowed items-center gap-3 opacity-50">
						<input type="checkbox" checked={upcomingEvents} disabled class="checkbox" />
						<div>
							<div class="font-medium">Upcoming events</div>
							<div class="text-surface-600-300-token text-sm">
								Get notified about events you're interested in
							</div>
						</div>
					</label>
				</div>
			</div>
		</div>
	</Card>
</div>
