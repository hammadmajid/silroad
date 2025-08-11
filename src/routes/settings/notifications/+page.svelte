<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	let emailNotifications = $state(true);
	let pushNotifications = $state(false);
	let marketingEmails = $state(false);
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
					<label class="flex items-center gap-3">
						<input type="checkbox" bind:checked={emailNotifications} class="checkbox" />
						<div>
							<div class="font-medium">Security alerts</div>
							<div class="text-surface-600-300-token text-sm">
								Get notified about security-related events
							</div>
						</div>
					</label>

					<label class="flex items-center gap-3">
						<input type="checkbox" bind:checked={marketingEmails} class="checkbox" />
						<div>
							<div class="font-medium">Product updates</div>
							<div class="text-surface-600-300-token text-sm">
								Receive updates about new features
							</div>
						</div>
					</label>
				</div>
			</div>

			<!-- Push Notifications -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Push Notifications</h2>
				<div class="space-y-4">
					<label class="flex items-center gap-3">
						<input type="checkbox" bind:checked={pushNotifications} class="checkbox" />
						<div>
							<div class="font-medium">Browser notifications</div>
							<div class="text-surface-600-300-token text-sm">Get notified in your browser</div>
						</div>
					</label>
				</div>
			</div>
		</div>
	</Card>
</div>
