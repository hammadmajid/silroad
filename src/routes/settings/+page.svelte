<script lang="ts">
	import Card from '$lib/components/Card.svelte';
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="container mx-auto max-w-4xl space-y-6 p-4">
	<div class="space-y-2">
		<h1 class="h1">Settings</h1>
		<p class="text-surface-600-400">Manage your account settings and preferences</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card variant="interactive" href="/settings/profile">
			<div class="space-y-2">
				<h3 class="h3">Profile</h3>
				<p class="text-sm text-surface-600-400">Update your personal information and bio</p>
			</div>
		</Card>

		<Card variant="interactive" href="/settings/account">
			<div class="space-y-2">
				<h3 class="h3">Account</h3>
				<p class="text-sm text-surface-600-400">Manage your email and password</p>
			</div>
		</Card>

		<Card variant="interactive" href="/settings/appearance">
			<div class="space-y-2">
				<h3 class="h3">Appearance</h3>
				<p class="text-sm text-surface-600-400">Customize your theme and display preferences</p>
			</div>
		</Card>

		<Card variant="interactive" href="/settings/notifications">
			<div class="space-y-2">
				<h3 class="h3">Notifications</h3>
				<p class="text-sm text-surface-600-400">Control your notification preferences</p>
			</div>
		</Card>

		<Card variant="interactive" href="/settings/organization">
			<div class="space-y-2">
				<h3 class="h3">Organization</h3>
				<p class="text-sm text-surface-600-400">Manage your organization settings</p>
			</div>
		</Card>

		<Card variant="interactive" href="/settings/payment">
			<div class="space-y-2">
				<h3 class="h3">Payment</h3>
				<p class="text-sm text-surface-600-400">Manage billing and payment methods</p>
			</div>
		</Card>
	</div>
</div>
