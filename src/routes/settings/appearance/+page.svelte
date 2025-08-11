<script lang="ts">
	import Card from '$lib/components/Card.svelte';

	let theme = $state('system');
	let language = $state('en');
</script>

<svelte:head>
	<title>Appearance - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<Card class="p-6">
		<h1 class="mb-6 h2">Appearance</h1>

		<div class="space-y-6">
			<!-- Theme -->
			<div>
				<h2 class="mb-4 h3">Theme</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">Choose how Silroad looks to you.</p>
					<div class="grid max-w-md grid-cols-3 gap-4">
						<label class="cursor-pointer">
							<input type="radio" bind:group={theme} value="light" class="sr-only" />
							<div
								class="rounded-lg border-2 p-4 text-center {theme === 'light'
									? 'border-primary-500'
									: 'border-surface-300-600-token'}"
							>
								<div class="mb-2 h-8 w-full rounded border bg-white"></div>
								<span class="text-sm">Light</span>
							</div>
						</label>

						<label class="cursor-pointer">
							<input type="radio" bind:group={theme} value="dark" class="sr-only" />
							<div
								class="rounded-lg border-2 p-4 text-center {theme === 'dark'
									? 'border-primary-500'
									: 'border-surface-300-600-token'}"
							>
								<div class="mb-2 h-8 w-full rounded border bg-gray-800"></div>
								<span class="text-sm">Dark</span>
							</div>
						</label>

						<label class="cursor-pointer">
							<input type="radio" bind:group={theme} value="system" class="sr-only" />
							<div
								class="rounded-lg border-2 p-4 text-center {theme === 'system'
									? 'border-primary-500'
									: 'border-surface-300-600-token'}"
							>
								<div
									class="mb-2 h-8 w-full rounded border bg-gradient-to-r from-white to-gray-800"
								></div>
								<span class="text-sm">System</span>
							</div>
						</label>
					</div>
				</div>
			</div>

			<!-- Language -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Language</h2>
				<div class="space-y-4">
					<p class="text-surface-600-300-token">Select your preferred language.</p>
					<select bind:value={language} class="select w-full max-w-xs">
						<option value="en">English</option>
						<option value="es">Español</option>
						<option value="fr">Français</option>
						<option value="de">Deutsch</option>
					</select>
				</div>
			</div>
		</div>
	</Card>
</div>
