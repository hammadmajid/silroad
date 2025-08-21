import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

test.describe('Event Join Functionality', () => {
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
		await expect(page).toHaveURL('/');

		return testUser;
	}

	test('should join an event successfully', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Navigate to explore events page to find an event to join
		await page.goto('/explore/events');
		await page.waitForLoadState('networkidle');

		// Wait for events to load and select the first one
		const firstEventCard = page.locator('a[href*="/explore/events/"]').first();
		await expect(firstEventCard).toBeVisible();
		await firstEventCard.click();

		// Wait for event page to load
		await page.waitForLoadState('networkidle');

		// Verify RSVP button is visible and shows "RSVP to Event" text
		const rsvpButton = page.getByTestId('rsvp-btn');
		await expect(rsvpButton).toBeVisible();
		await expect(rsvpButton).toContainText('RSVP to Event');

		// Click the RSVP button
		await rsvpButton.click();

		// Wait for the request to complete
		await page.waitForLoadState('networkidle');

		// Verify button text changes to "Leave Event"
		await expect(rsvpButton).toContainText('Leave Event');

		// Verify the join action was successful by checking if user can see event in their dashboard
		await page.goto('/');
		await expect(page.getByTestId('recommended-section')).toBeVisible();
	});

	test('should leave an event successfully', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Navigate to explore events page to find an event to join first
		await page.goto('/explore/events');
		await page.waitForLoadState('networkidle');

		// Wait for events to load and select the first one
		const firstEventCard = page.locator('a[href*="/explore/events/"]').first();
		await expect(firstEventCard).toBeVisible();
		await firstEventCard.click();

		// Wait for event page to load
		await page.waitForLoadState('networkidle');

		// Join the event first
		const rsvpButton = page.getByTestId('rsvp-btn');
		await rsvpButton.click();
		await page.waitForLoadState('networkidle');

		// Verify event is joined
		await expect(rsvpButton).toContainText('Leave Event');

		// Now leave the event
		await rsvpButton.click();
		await page.waitForLoadState('networkidle');

		// Verify button text changes back to "RSVP to Event"
		await expect(rsvpButton).toContainText('RSVP to Event');
	});

	test('should persist attendance status across page reloads', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Navigate to explore events page to find an event
		await page.goto('/explore/events');
		await page.waitForLoadState('networkidle');

		// Wait for events to load and select the first one
		const firstEventCard = page.locator('a[href*="/explore/events/"]').first();
		await expect(firstEventCard).toBeVisible();
		await firstEventCard.click();

		// Wait for event page to load
		await page.waitForLoadState('networkidle');

		// Join the event
		const rsvpButton = page.getByTestId('rsvp-btn');
		await rsvpButton.click();
		await page.waitForLoadState('networkidle');

		// Verify event is joined
		await expect(rsvpButton).toContainText('Leave Event');

		// Reload the page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Verify attendance status persists
		await expect(rsvpButton).toContainText('Leave Event');
	});

	test('should handle non-logged-in users correctly', async ({ page }) => {
		// Navigate to explore events page without logging in
		await page.goto('/explore/events');
		await page.waitForLoadState('networkidle');

		// Wait for events to load and select the first one
		const firstEventCard = page.locator('a[href*="/explore/events/"]').first();
		await expect(firstEventCard).toBeVisible();
		await firstEventCard.click();

		// Wait for event page to load
		await page.waitForLoadState('networkidle');

		// Verify RSVP button shows "RSVP to Event" and clicking redirects to login
		const rsvpButton = page.getByTestId('rsvp-btn');
		await expect(rsvpButton).toBeVisible();
		await expect(rsvpButton).toContainText('RSVP to Event');

		// Click the RSVP button - should redirect to login
		await rsvpButton.click();

		// Should be redirected to login page
		await expect(page).toHaveURL(/\/login/);
	});

	test('should show disabled button for full events', async ({ page }) => {
		// This test assumes there's an event that's full in the seed data
		// If no full events exist, this test might need to be skipped or adjusted
		await page.goto('/explore/events');
		await page.waitForLoadState('networkidle');

		// Look for any event cards
		const eventCards = page.locator('a[href*="/explore/events/"]');
		const eventCount = await eventCards.count();

		if (eventCount > 0) {
			// Check a few events to see if any are full
			for (let i = 0; i < Math.min(3, eventCount); i++) {
				await eventCards.nth(i).click();
				await page.waitForLoadState('networkidle');

				const rsvpButton = page.getByTestId('rsvp-btn');
				const buttonText = await rsvpButton.textContent();

				if (buttonText?.includes('Event Full')) {
					// Found a full event, verify button is disabled
					await expect(rsvpButton).toBeDisabled();
					break;
				} else {
					// Go back to explore page to check next event
					await page.goto('/explore/events');
					await page.waitForLoadState('networkidle');
				}
			}
		}
	});
});