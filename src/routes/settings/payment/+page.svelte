<script lang="ts">
	import Card from '$lib/components/Card.svelte';
</script>

<svelte:head>
	<title>Payment - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-6 h2">Payment & Billing</h1>

		<div class="space-y-6">
			<!-- Current Plan -->
			<div>
				<h2 class="mb-4 h3">Current Plan</h2>
				<div class="border-surface-300-600-token rounded-lg border p-6">
					<div class="flex items-center justify-between">
						<div>
							<h3 class="text-lg font-semibold">Free Plan</h3>
							<p class="text-surface-600-300-token">Perfect for getting started</p>
						</div>
						<div class="text-right">
							<div class="text-2xl font-bold">$0</div>
							<div class="text-surface-600-300-token text-sm">per month</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Upgrade -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Upgrade Plan</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">
						Upgrade to unlock more features and higher limits.
					</p>
					<button class="btn preset-filled-primary-500"> View Plans </button>
				</div>
			</div>

			<!-- Payment Methods -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Payment Methods</h2>
				<div class="space-y-4">
					<div class="border-surface-300-600-token rounded-lg border p-4">
						<p class="text-surface-600-300-token text-center">No payment methods added yet.</p>
					</div>
					<button class="btn preset-outlined"> Add Payment Method </button>
				</div>
			</div>
		</div>
	</Card>
</div>
