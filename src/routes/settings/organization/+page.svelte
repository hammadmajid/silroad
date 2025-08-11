<script lang="ts">
	import Card from '$lib/components/Card.svelte';
</script>

<svelte:head>
	<title>Organization - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-6 h2">Organization</h1>

		<div class="space-y-6">
			<!-- Create Organization -->
			<div>
				<h2 class="mb-4 h3">Create Organization</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">
						Organizations help you collaborate with team members.
					</p>
					<button class="btn preset-filled-primary-500"> Create New Organization </button>
				</div>
			</div>

			<!-- Current Organizations -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Your Organizations</h2>
				<div class="space-y-4">
					<div class="border-surface-300-600-token rounded-lg border p-4">
						<p class="text-surface-600-300-token text-center">
							You're not a member of any organizations yet.
						</p>
					</div>
				</div>
			</div>
		</div>
	</Card>
</div>
