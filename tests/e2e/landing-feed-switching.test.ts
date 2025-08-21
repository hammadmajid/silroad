import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

test.describe('Landing vs Feed Component Switching', () => {
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

	test('should show landing component for unauthenticated users', async ({ page }) => {
		// Visit home page without authentication
		await page.goto('/');

		// Should show landing page components
		await expect(page.getByRole('heading', { name: /Welcome to Silroad/i })).toBeVisible();

		// Should NOT show feed components
		await expect(
			page.getByRole('heading', { name: /Good (Morning|Afternoon|Evening)/ })
		).not.toBeVisible();
		await expect(page.getByRole('heading', { name: 'Your Upcoming Events' })).not.toBeVisible();
		await expect(page.getByRole('heading', { name: 'Recommended' })).not.toBeVisible();

		// Should show call-to-action for registration/login
		await expect(page.getByRole('link', { name: /Get Started|Sign Up|Register/i })).toBeVisible();
	});

	test('should show feed component for authenticated users', async ({ page }) => {
		// Create and login user
		await createAndLoginTestUser(page);

		// Navigate to home page
		await page.goto('/');

		// Should show feed components
		await expect(
			page.getByRole('heading', { name: /Good (Morning|Afternoon|Evening)/ })
		).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Your Upcoming Events' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Recommended' })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Past Events' })).toBeVisible();

		// Should show welcome back message
		await expect(page.getByText('Welcome back to Silroad')).toBeVisible();

		// Should NOT show landing page elements
		await expect(page.getByRole('heading', { name: /Welcome to Silroad/i })).not.toBeVisible();
	});

	test('should handle component switching with network delays', async ({ page }) => {
		// Simulate slow network
		await page.route('**/*', async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
			await route.continue();
		});

		// Test login with delay
		const testUser = {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			password: 'TestPass123'
		};

		// Register user with delay
		await page.goto('/register');
		await page.getByTestId('first-name-input').fill(testUser.firstName);
		await page.getByTestId('last-name-input').fill(testUser.lastName);
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);
		await page.getByTestId('terms-checkbox').check();
		await page.getByTestId('register-submit-btn').click();

		// Wait for navigation to complete
		await page.waitForLoadState('networkidle');

		// Navigate to home page
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Should eventually show feed component
		await expect(
			page.getByRole('heading', { name: /Good (Morning|Afternoon|Evening)/ })
		).toBeVisible();
	});
});
