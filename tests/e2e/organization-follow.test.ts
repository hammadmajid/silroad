import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

test.describe('Organization Follow/Unfollow Workflow', () => {
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

	// Seed database before all tests
	test.beforeAll(async () => {
		await fetch('http://localhost:8787/api/dev/seed', {
			method: 'POST'
		});
	});

	test('should follow an organization successfully', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Navigate to explore organizations page to find an organization to follow
		await page.goto('/explore/orgs');
		await page.waitForLoadState('networkidle');

		// Wait for organizations to load and select the first one
		const firstOrgCard = page.locator('a[href*="/explore/orgs/"]').first();
		await expect(firstOrgCard).toBeVisible();
		await firstOrgCard.click();

		// Wait for organization page to load
		await page.waitForLoadState('networkidle');

		// Verify follow button is visible and shows "Follow" text
		const followButton = page.getByTestId('follow-toggle-btn');
		await expect(followButton).toBeVisible();
		await expect(followButton).toContainText('Follow');

		// Click the follow button
		await followButton.click();

		// Wait for the request to complete
		await page.waitForLoadState('networkidle');

		// Verify button text changes to "Following" or "Unfollow"
		await expect(followButton).toContainText(/Following|Unfollow/);

		// Verify the follow action was successful by checking if user can see organization in their feed
		await page.goto('/');
		await expect(page.getByTestId('recommended-section')).toBeVisible();
	});

	test('should unfollow an organization successfully', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

		// Navigate to explore organizations page to find an organization to follow
		await page.goto('/explore/orgs');
		await page.waitForLoadState('networkidle');

		// Wait for organizations to load and select the first one
		const firstOrgCard = page.locator('a[href*="/explore/orgs/"]').first();
		await expect(firstOrgCard).toBeVisible();
		await firstOrgCard.click();

		// Wait for organization page to load
		await page.waitForLoadState('networkidle');

		// Follow the organization first
		const followButton = page.getByTestId('follow-toggle-btn');
		await followButton.click();
		await page.waitForLoadState('networkidle');

		// Verify organization is followed
		await expect(followButton).toContainText(/Following|Unfollow/);

		// Now unfollow
		await followButton.click();
		await page.waitForLoadState('networkidle');

		// Verify button text changes back to "Follow"
		await expect(followButton).toContainText('Follow');
	});

	test('should persist follow status across page reloads', async ({ page }) => {
		// Setup: Create and login user
		await createAndLoginTestUser(page);

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
		await followButton.click();
		await page.waitForLoadState('networkidle');

		// Reload the page
		await page.reload();

		// Verify follow status is maintained
		await expect(followButton).toContainText(/Following|Unfollow/);
	});

	test('should preserve org URL for unauthenticated user', async ({ page }) => {
		// Clear any existing session to ensure unauthenticated state
		await page.context().clearCookies();

		// Navigate to explore organizations to get an org URL
		await page.goto('/explore/orgs');
		await page.waitForLoadState('networkidle');

		// Get the first organization link
		const firstOrgCard = page.locator('a[href*="/explore/orgs/"]').first();
		await expect(firstOrgCard).toBeVisible();

		// Get the org URL to test redirect preservation
		const orgUrl = await firstOrgCard.getAttribute('href');

		// Navigate directly to the organization page while not logged in
		await page.goto(orgUrl!);
		await page.waitForLoadState('networkidle');

		// Try to click the follow button without being logged in
		const followButton = page.getByTestId('follow-toggle-btn');
		await expect(followButton).toBeVisible();
		await followButton.click();

		// Expected error message
		const errMsg = 'You must be logged in to follow organizations';
		// Should be redirected to login page with redirectTo parameter and error message
		const expectedRedirectUrl = `/login?redirectTo=${encodeURIComponent(orgUrl!)}&msg=${encodeURIComponent(errMsg)}`;
		await expect(page).toHaveURL(
			new RegExp(expectedRedirectUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		);

		// Verify error message is shown
		await expect(page.getByTestId('error-message')).toBeVisible();
		await expect(page.getByTestId('error-message')).toContainText(errMsg);

		// Fill login form with pre-seeded user credentials
		await page.getByTestId('email-input').fill('u@test.it');
		await page.getByTestId('password-input').fill('Pass!234');

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Should be redirected back to the original organization page
		await expect(page).toHaveURL(orgUrl!);

		// Verify we're on the correct organization page and can now follow
		await expect(followButton).toBeVisible();
		await expect(followButton).toContainText(/Follow|Following|Unfollow/);

		// Verify the follow action now works
		await followButton.click();
		await page.waitForLoadState('networkidle');
		await expect(followButton).toContainText(/Follow|Following|Unfollow/);
	});
});
