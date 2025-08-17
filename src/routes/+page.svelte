<script lang="ts">
	import Calendar from '@lucide/svelte/icons/calendar';
	import Building2 from '@lucide/svelte/icons/building-2';
	import UserPlus from '@lucide/svelte/icons/user-plus';
	import Search from '@lucide/svelte/icons/search';
	import Heart from '@lucide/svelte/icons/heart';
</script>

<svelte:head>
	<title>Silroad</title>
</svelte:head>

<!-- Main container with proper spacing between sections -->
<div class="space-y-16">
	<!-- Hero Section -->
	<section class="px-2 py-8 sm:px-4">
		<div class="grid items-center gap-12 md:grid-cols-2">
			<div class="space-y-6 text-center md:text-left">
				<header class="space-y-4">
					<h1 class="h1">Welcome to Silroad</h1>
					<p class="text-surface-600-300 text-xl">
						An event organizer platform that helps organizations create, manage, and promote events
						while connecting people through shared experiences.
					</p>
				</header>

				<div class="flex flex-col gap-4 sm:flex-row">
					<a
						href="/register"
						class="btn flex items-center gap-2 preset-filled"
						data-testid="get-started-btn"
					>
						<UserPlus size={20} />
						Get Started
					</a>
					<a href="/explore" class="btn flex items-center gap-2 preset-outlined-primary-500">
						<Search size={20} />
						Explore
					</a>
				</div>
			</div>

			<div class="flex justify-center">
				<div class="flex h-60 w-60 items-center justify-center rounded-full bg-primary-500/10">
					<div class="flex h-40 w-40 items-center justify-center rounded-full bg-primary-500/20">
						<Calendar size={64} class="text-primary-500" />
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="space-y-8 card rounded-container bg-surface-100-900 p-4 sm:p-8">
		<header class="space-y-4 text-center">
			<h2 class="text-3xl font-bold">Why Choose Silroad?</h2>
			<p class="text-surface-600-300 text-lg">
				Everything you need to create and manage successful events
			</p>
		</header>

		<div class="grid gap-8 md:grid-cols-3">
			<div class="space-y-4 card rounded-container preset-filled-surface-100-900 p-6 text-center">
				<div class="flex justify-center">
					<Calendar size={48} class="text-primary-500" />
				</div>
				<div class="space-y-2">
					<h3 class="text-xl font-semibold">Easy Event Creation</h3>
					<p class="text-surface-600-300">
						Create and manage events with our intuitive interface. Set dates, locations, and manage
						RSVPs effortlessly.
					</p>
				</div>
			</div>

			<div class="space-y-4 card rounded-container preset-filled-surface-100-900 p-6 text-center">
				<div class="flex justify-center">
					<Heart size={48} class="text-primary-500" />
				</div>
				<div class="space-y-2">
					<h3 class="text-xl font-semibold">Connect Communities</h3>
					<p class="text-surface-600-300">
						Bring people together through shared experiences. Build lasting connections within your
						community.
					</p>
				</div>
			</div>

			<div class="space-y-4 card rounded-container preset-filled-surface-100-900 p-6 text-center">
				<div class="flex justify-center">
					<Building2 size={48} class="text-primary-500" />
				</div>
				<div class="space-y-2">
					<h3 class="text-xl font-semibold">Organization Management</h3>
					<p class="text-surface-600-300">
						Manage multiple events, track memberships, and handle all aspects of your organization
						in one place.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="space-y-8 px-2 py-8 sm:px-4">
		<header class="space-y-4 text-center">
			<h2 class="text-3xl font-bold">How It Works</h2>
			<p class="text-surface-600-300 text-lg">Get started in just a few simple steps</p>
		</header>

		<div class="grid gap-8 md:grid-cols-3">
			<div class="space-y-4 text-center">
				<div class="flex justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white"
					>
						1
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-semibold">Create Your Account</h3>
					<p class="text-surface-600-300">
						Sign up with your email and set up your profile to get started with Silroad.
					</p>
				</div>
			</div>

			<div class="space-y-4 text-center">
				<div class="flex justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white"
					>
						2
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-semibold">Join or Create Events</h3>
					<p class="text-surface-600-300">
						Explore existing events in your area or create your own to bring your community
						together.
					</p>
				</div>
			</div>

			<div class="space-y-4 text-center">
				<div class="flex justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white"
					>
						3
					</div>
				</div>
				<div class="space-y-2">
					<h3 class="text-lg font-semibold">Connect & Engage</h3>
					<p class="text-surface-600-300">
						Meet new people, share experiences, and build lasting connections through meaningful
						events.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="space-y-6 card rounded-container bg-primary-500 p-4 text-black sm:p-8">
		<header class="space-y-4 text-center">
			<h2 class="text-3xl font-bold">Ready to Start Connecting?</h2>
			<p class="text-lg opacity-90">
				Join thousands of organizations already using Silroad to create amazing events and build
				stronger communities.
			</p>
		</header>

		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<a href="/register" class="btn flex items-center gap-2 preset-filled">
				<UserPlus size={20} />
				Create Your Account
			</a>
			<a href="/explore" class="btn flex items-center gap-2 preset-outlined">
				<Search size={20} />
				Browse
			</a>
		</div>
	</section>
</div>
