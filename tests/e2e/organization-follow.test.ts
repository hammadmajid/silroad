import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { loginTestUser } from './utils/auth-helpers.js';

test.describe('Organization Follow/Unfollow Workflow', () => {
	test('should follow an organization successfully', async ({ page }) => {
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
		if (!orgUrl) throw new Error('Organization URL not found');

		// Navigate directly to the organization page while not logged in
		await page.goto(orgUrl);
		await page.waitForLoadState('networkidle');

		// Try to click the follow button without being logged in
		const followButton = page.getByTestId('follow-toggle-btn');
		await expect(followButton).toBeVisible();
		await followButton.click();

		// Expected error message
		const errMsg = 'You must be logged in to follow organizations';
		// Should be redirected to login page with redirectTo parameter and error message
		const expectedRedirectUrl = `/login?redirectTo=${encodeURIComponent(orgUrl)}&msg=${encodeURIComponent(errMsg)}`;
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
		await expect(page).toHaveURL(orgUrl);

		// Verify we're on the correct organization page and can now follow
		await expect(followButton).toBeVisible();
		await expect(followButton).toContainText(/Follow|Following|Unfollow/);

		// Verify the follow action now works
		await followButton.click();
		await page.waitForLoadState('networkidle');
		await expect(followButton).toContainText(/Follow|Following|Unfollow/);
	});
});
