import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Helper function to login with pre-seeded test user
 * @param page - Playwright page object
 * @returns Promise with user info for tests that need it
 */
export async function loginTestUser(page: Page) {
	await page.goto('/login');
	await page.getByTestId('email-input').fill('u@test.it');
	await page.getByTestId('password-input').fill('Pass!234');
	await page.getByTestId('login-submit-btn').click();

	// Wait for login to complete
	await expect(page).toHaveURL('/');

	// Return user info for tests that need it
	return {
		email: 'u@test.it',
		fullName: 'Test User' // This should match what's in the seed data
	};
}
