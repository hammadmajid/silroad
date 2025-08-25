import { expect, test } from '@playwright/test';
import { loginTestUser } from './utils/auth-helpers.js';

test.describe('User Feed with Followed Organizations', () => {
	test('should show events from followed organizations in recommended section', async ({
		page
	}) => {
		// Setup: Login with pre-seeded user
		await loginTestUser(page);

		// Navigate to explore organizations page to find an organization to follow
		await page.goto('/explore/orgs');
		await page.waitForLoadState('networkidle');

		// Wait for organizations to load and select the first one
		const firstOrgCard = page.locator('a[href*="/explore/orgs/"]').first();
		await expect(firstOrgCard).toBeVisible();
		await firstOrgCard.click();

		// Wait for organization page to load
		await page.waitForLoadState('networkidle');

		// Follow the organization
		const followButton = page.getByTestId('follow-toggle-btn');
		await expect(followButton).toBeVisible();

		// Check if it says "Follow" (not already following)
		const buttonText = await followButton.textContent();
		if (buttonText?.includes('Follow') && !buttonText?.includes('Unfollow')) {
			await followButton.click();
			await page.waitForLoadState('networkidle');

			// Wait for the button to change to "Unfollow"
			await expect(followButton).toContainText('Unfollow');
		}

		// Navigate to home page
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Verify recommended section exists
		const recommendedSection = page.getByTestId('recommended-section');
		await expect(recommendedSection).toBeVisible();

		// Check if there are events shown in the recommended section
		// Should either show events from followed organizations OR the appropriate empty state
		const eventsInRecommended = recommendedSection.getByTestId('event-card');
		// const noEventsMessage = recommendedSection.getByText('No events from organizations you follow');

		// One of these should be visible
		expect((await eventsInRecommended.count()) > 0).toBe(true);
	});

	test('should show empty state when no followed organizations have events', async ({ page }) => {
		// Setup: Login with pre-seeded user
		await loginTestUser(page);

		// Navigate to home page (user follows no organizations)
		await page.goto('/');

		// Check recommended section shows empty state
		const recommendedSection = page.locator('[data-testid="recommended-section"]');
		await expect(recommendedSection).toBeVisible();

		// Should show message about no events from followed organizations
		await expect(page.getByText('No events from organizations you follow')).toBeVisible();
		await expect(page.getByRole('link', { name: 'Explore Organizations' })).toBeVisible();
	});

	// TODO: RSVP login not implemented yet
	// test('should show user upcoming events section when user has RSVPs', async ({ page }) => {
	// 	// Setup: Create and login user
	// 	await createAndLoginTestUser(page);

	// 	// RSVP to an event
	// 	// select a random event from /explore/events page
	// 	const rsvpButton = page.getByTestId('rsvp-btn');
	// 	if (await rsvpButton.isVisible()) {
	// 		await rsvpButton.click();
	// 		await page.waitForLoadState('networkidle');
	// 	}

	// 	// Navigate to home page
	// 	await page.goto('/');

	// 	// Verify upcoming events section shows the event user is attending
	// 	const upcomingSection = page.locator('section:has-text("Your Upcoming Events")');
	// 	await expect(upcomingSection).toBeVisible();
	// });

	test('should show empty state for upcoming events when user has no RSVPs', async ({ page }) => {
		// Setup: Login with pre-seeded user
		await loginTestUser(page);

		// Navigate to home page
		await page.goto('/');

		// Verify upcoming events section shows empty state
		const upcomingSection = page.locator('section:has-text("Your Upcoming Events")');
		await expect(upcomingSection).toBeVisible();
		await expect(
			upcomingSection.getByText("You're not attending any upcoming events")
		).toBeVisible();
		await expect(upcomingSection.getByRole('link', { name: 'Explore Events' })).toBeVisible();
	});

	test('should show correct time-based greeting', async ({ page }) => {
		// Setup: Login with pre-seeded user
		await loginTestUser(page);

		// Navigate to home page
		await page.goto('/');

		// Check that one of the time-based greetings is shown
		const greetingPattern = /Good (Morning|Afternoon|Evening)/;
		await expect(page.getByRole('heading', { name: greetingPattern })).toBeVisible();
	});
});
