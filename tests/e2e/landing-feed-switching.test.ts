import { expect, test } from '@playwright/test';
import { loginTestUser } from './utils/auth-helpers.js';

test.describe('Landing vs Feed Component Switching', () => {
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
		// Login with pre-seeded user
		await loginTestUser(page);

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

		// Test login with delay using pre-seeded user
		await page.goto('/login');
		await page.getByTestId('email-input').fill('u@test.it');
		await page.getByTestId('password-input').fill('Pass!234');
		await page.getByTestId('login-submit-btn').click();

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
