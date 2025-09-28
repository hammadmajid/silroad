<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { PLANS, getPlanConfig } from '$lib/utils/plans';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	const currentPlanConfig = getPlanConfig(data.userPlan);
	const isOnFreePlan = data.userPlan === 'free';

	let selectedPlan: 'free' | 'premium' = data.userPlan;
	let isUpgrading = $state(false);
</script>

<svelte:head>
	<title>Payment - Settings | Silroad</title>
</svelte:head>

<div class="space-y-6">
	<!-- Success/Error Messages -->
	{#if form?.success}
		<Alert type="success" class="mb-6">
			<h3 class="font-semibold">Success!</h3>
			<p>{form.message}</p>
		</Alert>
	{:else if form?.error}
		<Alert type="error" class="mb-6">
			<h3 class="font-semibold">Error</h3>
			<p>{form.error}</p>
		</Alert>
	{/if}

	<Card class="p-6">
		<h1 class="mb-6 h2">Payment & Billing</h1>

		<div class="space-y-6">
			<!-- Current Plan -->
			<div>
				<h2 class="mb-4 h3">Current Plan</h2>
				<div class="border-surface-300-600-token rounded-lg border p-6">
					<div class="flex items-center justify-between">
						<div>
							<div class="mb-2 flex items-center gap-3">
								<h3 class="text-lg font-semibold">{currentPlanConfig.name} Plan</h3>
								{#if data.userPlan === 'premium'}
									<Badge variant="filled">Premium</Badge>
								{:else}
									<Badge variant="filled">Free</Badge>
								{/if}
							</div>
							<p class="text-surface-600-300-token">{currentPlanConfig.description}</p>

							<!-- Current plan features -->
							<div class="mt-4">
								<p class="text-surface-700-200-token mb-2 text-sm font-medium">
									Included features:
								</p>
								<ul class="text-surface-600-300-token space-y-1 text-sm">
									{#each currentPlanConfig.features as feature (feature)}
										<li class="flex items-center gap-2">
											<svg
												class="size-4 flex-shrink-0 text-green-500"
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
						</div>
						<div class="text-right">
							<div class="text-2xl font-bold">
								{#if currentPlanConfig.price === 0}
									Free
								{:else}
									${currentPlanConfig.price}
								{/if}
							</div>
							{#if currentPlanConfig.price > 0}
								<div class="text-surface-600-300-token text-sm">per month</div>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Plan Selection -->
			{#if isOnFreePlan}
				<div class="border-surface-300-600-token border-t pt-6">
					<h2 class="mb-4 h3">Available Plans</h2>
					<div class="grid gap-4 md:grid-cols-2">
						{#each Object.entries(PLANS) as [planKey, planConfig] (planKey)}
							<div
								class="border-surface-300-600-token relative rounded-lg border p-6 transition-all hover:border-primary-500 {selectedPlan ===
								planKey
									? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
									: ''}"
							>
								{#if planKey === 'premium'}
									<div
										class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-3 py-1 text-xs font-medium text-white"
									>
										Most Popular
									</div>
								{/if}

								<div class="mb-4">
									<div class="mb-2 flex items-center gap-3">
										<h3 class="text-lg font-semibold">{planConfig.name}</h3>
										{#if planKey === 'premium'}
											<Badge>Recommended</Badge>
										{/if}
									</div>
									<p class="text-surface-600-300-token text-sm">{planConfig.description}</p>
								</div>

								<div class="mb-4">
									<div class="text-2xl font-bold">
										{#if planConfig.price === 0}
											Free
										{:else}
											${planConfig.price}
										{/if}
									</div>
									{#if planConfig.price > 0}
										<div class="text-surface-600-300-token text-sm">per month</div>
									{/if}
								</div>

								<ul class="mb-6 space-y-2">
									{#each planConfig.features as feature (feature)}
										<li class="flex items-center gap-2 text-sm">
											<svg
												class="size-4 flex-shrink-0 text-green-500"
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

								{#if planKey === 'free'}
									<button class="btn w-full preset-outlined" disabled> Current Plan </button>
								{:else}
									<form
										method="POST"
										action="?/upgrade"
										use:enhance={() => {
											isUpgrading = true;
											return async ({ update }) => {
												isUpgrading = false;
												update();
											};
										}}
									>
										<input type="hidden" name="plan" value={planKey} />
										<button
											class="btn w-full preset-filled-primary-500"
											type="submit"
											disabled={isUpgrading}
										>
											{#if isUpgrading}
												<svg class="mr-2 size-4 animate-spin" fill="none" viewBox="0 0 24 24">
													<circle
														class="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														stroke-width="4"
													></circle>
													<path
														class="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
												Upgrading...
											{:else}
												Upgrade to {planConfig.name}
											{/if}
										</button>
									</form>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Premium user - show downgrade option -->
				<div class="border-surface-300-600-token border-t pt-6">
					<h2 class="mb-4 h3">Plan Management</h2>
					<div class="space-y-4">
						<div
							class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
						>
							<div class="flex items-center gap-3">
								<div class="rounded-full bg-green-100 p-2 dark:bg-green-900/40">
									<svg
										class="size-5 text-green-600 dark:text-green-400"
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
								</div>
								<div>
									<h3 class="font-semibold text-green-800 dark:text-green-200">
										You're on Premium!
									</h3>
									<p class="text-sm text-green-700 dark:text-green-300">
										Enjoy all premium features including organization creation and advanced
										analytics.
									</p>
								</div>
							</div>
						</div>

						<form
							method="POST"
							action="?/downgrade"
							use:enhance={() => {
								isUpgrading = true;
								return async ({ update }) => {
									isUpgrading = false;
									update();
								};
							}}
						>
							<button class="preset-ghost btn text-sm" type="submit" disabled={isUpgrading}>
								{#if isUpgrading}
									<svg class="mr-2 size-4 animate-spin" fill="none" viewBox="0 0 24 24">
										<circle
											class="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											stroke-width="4"
										></circle>
										<path
											class="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Processing...
								{:else}
									Cancel Premium Plan
								{/if}
							</button>
						</form>
					</div>
				</div>
			{/if}

			<!-- Billing Information -->
			<div class="border-surface-300-600-token border-t pt-6">
				<h2 class="mb-4 h3">Billing Information</h2>
				<div class="space-y-4">
					{#if data.userPlan === 'premium'}
						<div class="border-surface-300-600-token rounded-lg border p-4">
							<div class="mb-4 flex items-center justify-between">
								<h3 class="font-semibold">Payment Method</h3>
								<Badge>Active</Badge>
							</div>
							<div class="flex items-center gap-3">
								<div class="bg-surface-200-700-token rounded p-2">
									<svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
										/>
									</svg>
								</div>
								<div>
									<p class="font-medium">•••• •••• •••• 4242</p>
									<p class="text-surface-600-300-token text-sm">Expires 12/2028</p>
								</div>
							</div>
						</div>
					{:else}
						<div class="border-surface-300-600-token rounded-lg border p-4">
							<p class="text-surface-600-300-token text-center">
								No payment methods needed for the free plan.
							</p>
						</div>
					{/if}

					{#if data.userPlan === 'premium'}
						<button class="btn preset-outlined" disabled> Update Payment Method </button>
					{/if}
				</div>
			</div>

			<!-- Billing History -->
			{#if data.userPlan === 'premium'}
				<div class="border-surface-300-600-token border-t pt-6">
					<h2 class="mb-4 h3">Billing History</h2>
					<div class="space-y-2">
						<div
							class="border-surface-300-600-token flex items-center justify-between rounded-lg border p-4"
						>
							<div>
								<p class="font-medium">Premium Plan</p>
								<p class="text-surface-600-300-token text-sm">Dec 1, 2024</p>
							</div>
							<div class="text-right">
								<p class="font-medium">$9.99</p>
								<Badge>Paid</Badge>
							</div>
						</div>
						<div
							class="border-surface-300-600-token flex items-center justify-between rounded-lg border p-4"
						>
							<div>
								<p class="font-medium">Premium Plan</p>
								<p class="text-surface-600-300-token text-sm">Nov 1, 2024</p>
							</div>
							<div class="text-right">
								<p class="font-medium">$9.99</p>
								<Badge>Paid</Badge>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</Card>
</div>
