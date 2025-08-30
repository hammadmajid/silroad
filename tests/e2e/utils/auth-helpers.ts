import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

/**
 * Helper function to login with pre-seeded test user
 * @param page - Playwright page object
 * @returns Promise with user info for tests that need it
 */
export async function loginTestUser(page: Page) {
	// Generate unique user data
	const firstName = faker.person.firstName();
	const lastName = faker.person.lastName();
	const email = faker.internet.email();
	const password = 'TestPass123';

	// Register the user
	await page.goto('/register');
	await page.getByTestId('first-name-input').fill(firstName);
	await page.getByTestId('last-name-input').fill(lastName);
	await page.getByTestId('email-input').fill(email);
	await page.getByTestId('password-input').fill(password);
	await page.getByTestId('terms-checkbox').check();
	await page.getByTestId('register-submit-btn').click();
	await expect(page).toHaveURL('/');

	// Log in (if not already authenticated)
	// Optionally, you could skip this if registration auto-logs in
	// But for consistency, clear cookies and log in again
	await page.context().clearCookies();
	await page.goto('/login');
	await page.getByTestId('email-input').fill(email);
	await page.getByTestId('password-input').fill(password);
	await page.getByTestId('login-submit-btn').click();
	await expect(page).toHaveURL('/');

	// Return user info for tests that need it
	return {
		email,
		fullName: `${firstName} ${lastName}`
	};
}
