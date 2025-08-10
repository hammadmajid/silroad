<script lang="ts">
	import { Accordion } from '@skeletonlabs/skeleton-svelte';

	let gettingStartedValue = $state<string[]>([]);
	let eventsValue = $state<string[]>([]);
	let accountValue = $state<string[]>([]);
	let techValue = $state<string[]>([]);
</script>

<div class="container mx-auto max-w-4xl px-4 py-12">
	<div class="space-y-8">
		<header class="text-center">
			<h1 class="mb-4 text-4xl font-bold">Help & Support</h1>
			<p class="text-surface-600-300 text-xl">
				Find answers to frequently asked questions about using Silroad
			</p>
		</header>

		<div class="space-y-6">
			<section class="card p-6">
				<h2 class="mb-6 text-2xl font-semibold">Getting Started</h2>

				<Accordion
					value={gettingStartedValue}
					onValueChange={(e) => (gettingStartedValue = e.value)}
				>
					<Accordion.Item value="create-account">
						{#snippet control()}How do I create an account?{/snippet}
						{#snippet panel()}
							Click the "Login" button in the top navigation, then select "Create Account" on the
							login page. You'll need to provide your name, email address, and create a secure
							password.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="reset-password">
						{#snippet control()}How do I reset my password?{/snippet}
						{#snippet panel()}
							On the login page, click "Forgot Password" and enter your email address. We'll send
							you instructions to reset your password securely.
						{/snippet}
					</Accordion.Item>
				</Accordion>
			</section>

			<section class="card p-6">
				<h2 class="mb-6 text-2xl font-semibold">Events & Organizations</h2>

				<Accordion value={eventsValue} onValueChange={(e) => (eventsValue = e.value)}>
					<Accordion.Item value="create-event">
						{#snippet control()}How do I create an event?{/snippet}
						{#snippet panel()}
							After logging in, navigate to your organization profile and look for the "Create
							Event" button. Fill out the event details including title, description, date, time,
							and location.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="find-events">
						{#snippet control()}How do I find events to attend?{/snippet}
						{#snippet panel()}
							Visit the "Explore" page to browse all available events. You can filter by date,
							location, category, or search for specific keywords to find events that interest you.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="register-org">
						{#snippet control()}How do I register an organization?{/snippet}
						{#snippet panel()}
							Organizations can be registered through your profile settings. Provide your
							organization's name, description, and contact information to get started with event
							creation.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="edit-event">
						{#snippet control()}Can I edit or cancel an event after creating it?{/snippet}
						{#snippet panel()}
							Yes, you can edit event details or cancel events from your organization's dashboard.
							Be sure to notify attendees of any changes through the platform's communication tools.
						{/snippet}
					</Accordion.Item>
				</Accordion>
			</section>

			<section class="card p-6">
				<h2 class="mb-6 text-2xl font-semibold">Account & Privacy</h2>

				<Accordion value={accountValue} onValueChange={(e) => (accountValue = e.value)}>
					<Accordion.Item value="update-profile">
						{#snippet control()}How do I update my profile information?{/snippet}
						{#snippet panel()}
							Click on your profile icon in the top navigation and select "Profile Settings". You
							can update your name, email, profile picture, and other personal information from
							there.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="security">
						{#snippet control()}Is my personal information secure?{/snippet}
						{#snippet panel()}
							Yes, we take privacy and security seriously. All personal data is encrypted and stored
							securely. See our Privacy Policy for detailed information about how we protect your
							data.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="delete-account">
						{#snippet control()}How do I delete my account?{/snippet}
						{#snippet panel()}
							Account deletion can be requested through your profile settings. Please note that this
							action is permanent and will remove all your data from our platform.
						{/snippet}
					</Accordion.Item>
				</Accordion>
			</section>

			<section class="card p-6">
				<h2 class="mb-6 text-2xl font-semibold">Technical Support</h2>

				<Accordion value={techValue} onValueChange={(e) => (techValue = e.value)}>
					<Accordion.Item value="browsers">
						{#snippet control()}What browsers are supported?{/snippet}
						{#snippet panel()}
							Silroad works best on modern browsers including Chrome, Firefox, Safari, and Edge. We
							recommend keeping your browser updated for the best experience.
						{/snippet}
					</Accordion.Item>

					<hr class="hr" />

					<Accordion.Item value="tech-issues">
						{#snippet control()}I'm experiencing technical issues. What should I do?{/snippet}
						{#snippet panel()}
							Try refreshing the page or clearing your browser cache first. If issues persist,
							please check our status page or report the issue through our support channels.
						{/snippet}
					</Accordion.Item>
				</Accordion>
			</section>
		</div>

		<section class="text-center">
			<h2 class="mb-4 text-2xl font-semibold">Still Need Help?</h2>
			<p class="mb-6">
				If you can't find the answer you're looking for, don't hesitate to reach out to our support
				team.
			</p>
			<a href="/explore" class="btn preset-filled">Back to Explore</a>
		</section>
	</div>
</div>
