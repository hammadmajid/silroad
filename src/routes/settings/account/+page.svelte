<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Key from '@lucide/svelte/icons/key';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CheckCircle from '@lucide/svelte/icons/check-circle';

	let { data } = $props();
</script>

<svelte:head>
	<title>Account - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	{#if data.successMessage}
		<Alert type="success" title="Success">
			{#snippet icon()}
				<CheckCircle />
			{/snippet}
			{data.successMessage}
		</Alert>
	{/if}

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
							value={data.user.email}
							disabled
						/>
					</div>
					<a href="/settings/account/change-email" class="btn preset-outlined btn-sm">
						Change Email
					</a>
				</div>
			</div>

			<!-- Password -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Password</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">Manage your password and security settings.</p>
					<a
						href="/settings/account/change-password"
						class="btn flex items-center gap-2 preset-outlined btn-sm"
					>
						<Key size={16} />
						Change Password
					</a>
				</div>
			</div>
		</div>
	</Card>

	<!-- Danger Zone -->
	<Card variant="form" class="space-y-4 border-error-500 p-6">
		<header>
			<h2 class="h3 text-error-500">Danger Zone</h2>
		</header>

		<div
			class="flex items-center justify-between rounded-lg border border-error-300 bg-error-50 p-4 dark:border-error-600 dark:bg-error-900/20"
		>
			<div class="space-y-1">
				<h3 class="font-medium text-error-700 dark:text-error-300">Delete Account</h3>
				<p class="text-sm text-error-600 dark:text-error-400">
					Permanently delete your account and all data
				</p>
			</div>
			<a
				href="/settings/account/confirm-delete"
				class="btn flex items-center gap-2 preset-filled-error-500 btn-sm"
			>
				<Trash2 size={16} />
				Delete Account
			</a>
		</div>
	</Card>
</div>
