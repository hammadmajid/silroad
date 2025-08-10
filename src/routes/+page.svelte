<svelte:head>
	<title>Silroad</title>
</svelte:head>

<section class="container mx-auto px-4 py-16">
	<div class="grid items-center gap-12 md:grid-cols-2">
		<div class="text-center md:text-left">
			<h1 class="mb-4 h1">Welcome to Silroad</h1>
			<p class="text-surface-600-300 mb-8 text-xl">
				An event organizer platform that helps organizations create, manage, and promote events
				while connecting people through shared experiences.
			</p>
			<div class="flex flex-col gap-4 sm:flex-row">
				<a href="/register" class="btn preset-filled" data-testid="get-started-btn">Get Started</a>
				<a href="/explore" class="btn preset-outlined">Explore Events</a>
			</div>
		</div>

		<div class="flex justify-center">
			<svg
				width="300"
				height="240"
				viewBox="0 0 300 240"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				class="text-primary-500"
			>
				<circle cx="150" cy="120" r="80" fill="currentColor" opacity="0.1" />
				<circle cx="150" cy="120" r="60" fill="currentColor" opacity="0.2" />
				<circle cx="150" cy="120" r="40" fill="currentColor" opacity="0.3" />

				<circle cx="90" cy="80" r="12" fill="currentColor" />
				<circle cx="210" cy="80" r="12" fill="currentColor" />
				<circle cx="150" cy="60" r="12" fill="currentColor" />
				<circle cx="120" cy="160" r="12" fill="currentColor" />
				<circle cx="180" cy="160" r="12" fill="currentColor" />
				<circle cx="70" cy="140" r="12" fill="currentColor" />
				<circle cx="230" cy="140" r="12" fill="currentColor" />

				<line
					x1="150"
					y1="120"
					x2="90"
					y2="80"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>
				<line
					x1="150"
					y1="120"
					x2="210"
					y2="80"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>
				<line
					x1="150"
					y1="120"
					x2="150"
					y2="60"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>
				<line
					x1="150"
					y1="120"
					x2="120"
					y2="160"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>
				<line
					x1="150"
					y1="120"
					x2="180"
					y2="160"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>
				<line
					x1="150"
					y1="120"
					x2="70"
					y2="140"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>
				<line
					x1="150"
					y1="120"
					x2="230"
					y2="140"
					stroke="currentColor"
					stroke-width="2"
					opacity="0.6"
				/>

				<circle cx="150" cy="120" r="16" fill="currentColor" />
			</svg>
		</div>
	</div>
</section>

<section class="bg-surface-100-800 py-16">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold">Why Choose Silroad?</h2>
			<p class="text-surface-600-300 text-lg">
				Everything you need to create and manage successful events
			</p>
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			<div class="card p-6 text-center">
				<div class="mb-4 flex justify-center">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-primary-500">
						<rect x="8" y="12" width="32" height="24" rx="4" fill="currentColor" opacity="0.2" />
						<rect x="12" y="16" width="24" height="4" fill="currentColor" />
						<rect x="12" y="24" width="16" height="2" fill="currentColor" opacity="0.6" />
						<rect x="12" y="28" width="20" height="2" fill="currentColor" opacity="0.6" />
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-semibold">Easy Event Creation</h3>
				<p class="text-surface-600-300">
					Create and manage events with our intuitive interface. Set dates, locations, and manage
					RSVPs effortlessly.
				</p>
			</div>

			<div class="card p-6 text-center">
				<div class="mb-4 flex justify-center">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-primary-500">
						<circle cx="24" cy="24" r="16" fill="currentColor" opacity="0.2" />
						<circle cx="18" cy="20" r="3" fill="currentColor" />
						<circle cx="30" cy="20" r="3" fill="currentColor" />
						<circle cx="24" cy="32" r="3" fill="currentColor" />
						<circle cx="12" cy="28" r="3" fill="currentColor" />
						<circle cx="36" cy="28" r="3" fill="currentColor" />
						<line x1="24" y1="24" x2="18" y2="20" stroke="currentColor" stroke-width="1.5" />
						<line x1="24" y1="24" x2="30" y2="20" stroke="currentColor" stroke-width="1.5" />
						<line x1="24" y1="24" x2="24" y2="32" stroke="currentColor" stroke-width="1.5" />
						<line x1="24" y1="24" x2="12" y2="28" stroke="currentColor" stroke-width="1.5" />
						<line x1="24" y1="24" x2="36" y2="28" stroke="currentColor" stroke-width="1.5" />
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-semibold">Connect Communities</h3>
				<p class="text-surface-600-300">
					Bring people together through shared experiences. Build lasting connections within your
					community.
				</p>
			</div>

			<div class="card p-6 text-center">
				<div class="mb-4 flex justify-center">
					<svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-primary-500">
						<rect x="6" y="8" width="36" height="32" rx="4" fill="currentColor" opacity="0.2" />
						<circle cx="16" cy="20" r="4" fill="currentColor" />
						<circle cx="32" cy="20" r="4" fill="currentColor" />
						<rect x="12" y="28" width="24" height="8" rx="2" fill="currentColor" opacity="0.6" />
					</svg>
				</div>
				<h3 class="mb-2 text-xl font-semibold">Organization Management</h3>
				<p class="text-surface-600-300">
					Manage multiple events, track memberships, and handle all aspects of your organization in
					one place.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="py-16">
	<div class="container mx-auto px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 text-3xl font-bold">How It Works</h2>
			<p class="text-surface-600-300 text-lg">Get started in just a few simple steps</p>
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			<div class="text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white"
					>
						1
					</div>
				</div>
				<h3 class="mb-2 text-lg font-semibold">Create Your Account</h3>
				<p class="text-surface-600-300">
					Sign up with your email and set up your profile to get started with Silroad.
				</p>
			</div>

			<div class="text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white"
					>
						2
					</div>
				</div>
				<h3 class="mb-2 text-lg font-semibold">Join or Create Events</h3>
				<p class="text-surface-600-300">
					Explore existing events in your area or create your own to bring your community together.
				</p>
			</div>

			<div class="text-center">
				<div class="mb-4 flex justify-center">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 text-lg font-bold text-white"
					>
						3
					</div>
				</div>
				<h3 class="mb-2 text-lg font-semibold">Connect & Engage</h3>
				<p class="text-surface-600-300">
					Meet new people, share experiences, and build lasting connections through meaningful
					events.
				</p>
			</div>
		</div>
	</div>
</section>

<section class="bg-primary-500 py-16 text-black">
	<div class="container mx-auto px-4 text-center">
		<h2 class="mb-4 text-3xl font-bold">Ready to Start Connecting?</h2>
		<p class="mb-8 text-lg opacity-90">
			Join thousands of organizations already using Silroad to create amazing events and build
			stronger communities.
		</p>
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
			<a href="/register" class="btn preset-filled">Create Your Account</a>
			<a href="/explore" class="btn preset-outlined">Browse Events</a>
		</div>
	</div>
</section>
