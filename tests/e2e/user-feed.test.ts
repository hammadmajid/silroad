import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

test.describe('User Feed with Followed Organizations', () => {
	// Helper function to create and login a test user
	async function createAndLoginTestUser(page: Page) {
		const testUser = {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			password: 'TestPass123'
		};

		// Register the user
		await page.goto('/register');
		await page.getByTestId('first-name-input').fill(testUser.firstName);
		await page.getByTestId('last-name-input').fill(testUser.lastName);
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);
		await page.getByTestId('terms-checkbox').check();
		await page.getByTestId('register-submit-btn').click();

		// Wait for registration to complete
		await expect(page).toHaveURL('/explore');

		return testUser;
	}

	async function seedDatabase(page: Page) {
		const response = await page.request.post('/api/dev/seed');
		expect(response.status()).toBe(200);
		await page.waitForTimeout(1000); // Give database time to process
	}

	test('should show events from followed organizations in recommended section', async ({
		page
	}) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Setup: Create organization with events
		await seedDatabase(page);

		// Follow the organization
		// TODO: Selected a random organizaton and follow it
		// await page.getByTestId('follow-toggle-btn').click();
		// await page.waitForLoadState('networkidle');

		// Navigate to home page
		await page.goto('/');

		// Verify recommended section exists and shows events from followed organization
		const recommendedSection = page.locator('[data-testid="recommended-section"]');
		await expect(recommendedSection).toBeVisible();

		// TODO: Look for the event from followed organization
		// Edge case: seeded organization might not have any upcoming event
	});

	test('should show empty state when no followed organizations have events', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

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
		// Setup: Create and login user
		await createAndLoginTestUser(page);

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
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Navigate to home page
		await page.goto('/');

		// Check that one of the time-based greetings is shown
		const greetingPattern = /Good (Morning|Afternoon|Evening)/;
		await expect(page.getByRole('heading', { name: greetingPattern })).toBeVisible();
	});
});
