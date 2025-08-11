<script lang="ts">
	import Card from '$lib/components/Card.svelte';
</script>

<svelte:head>
	<title>Account - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-6 h2">Account Settings</h1>

		<div class="space-y-6">
			<!-- Email Settings -->
			<div>
				<h2 class="mb-4 h3">Email</h2>
				<div class="space-y-4">
					<div>
						<label for="primary-email" class="mb-2 label-text block">Primary Email</label>
						<input
							id="primary-email"
							class="input w-full max-w-md"
							placeholder="user@example.com"
							disabled
						/>
					</div>
					<button class="btn preset-outlined btn-sm"> Change Email </button>
				</div>
			</div>

			<!-- Password -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Password</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">Manage your password and security settings.</p>
					<button class="btn preset-outlined btn-sm"> Change Password </button>
				</div>
			</div>

			<!-- Two-Factor Authentication -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Two-Factor Authentication</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">Add an extra layer of security to your account.</p>
					<button class="btn preset-filled-primary-500 btn-sm"> Enable 2FA </button>
				</div>
			</div>
		</div>
	</Card>
</div>
