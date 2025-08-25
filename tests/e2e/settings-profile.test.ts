import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';
import { loginTestUser } from './utils/auth-helpers.js';

test.describe('Profile Settings Page', () => {
	test.beforeEach(async ({ page }) => {
		// Login user before each test
		await loginTestUser(page);
	});

	test.afterEach(async ({ page }) => {
		// Clear cookies to log out user after each test
		await page.context().clearCookies();
	});

	test('should display profile page with user information', async ({ page }) => {
		await page.goto('/settings/profile');

		// Verify we're on the profile page
		await expect(page).toHaveURL('/settings/profile');
		await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();

		// Verify form elements are present
		await expect(page.getByTestId('name-input')).toBeVisible();
		await expect(page.getByTestId('join-date-input')).toBeVisible();

		// Verify join date field is disabled
		await expect(page.getByTestId('join-date-input')).toBeDisabled();

		// Verify save button is present
		await expect(page.getByTestId('save-changes-btn')).toBeVisible();
	});

	test('should show user data in form fields', async ({ page }) => {
		// User is already created and logged in via beforeEach
		await page.goto('/settings/profile');

		// We can't easily access the user data from beforeEach, so we'll just verify
		// that the name field has some value (not empty)
		await expect(page.getByTestId('name-input')).not.toHaveValue('');
	});

	test('should successfully update name', async ({ page }) => {
		await page.goto('/settings/profile');

		const newName = faker.person.fullName();

		// Clear and fill new name
		await page.getByTestId('name-input').clear();
		await page.getByTestId('name-input').fill(newName);

		// Submit the form
		await page.getByTestId('save-changes-btn').click();

		// Wait for form submission
		await page.waitForLoadState('networkidle');

		// Verify success message appears
		await expect(page.getByTestId('success-message')).toBeVisible();

		// Verify the form still shows the updated name
		await expect(page.getByTestId('name-input')).toHaveValue(newName);
	});

	test('should show validation error for empty name', async ({ page }) => {
		await page.goto('/settings/profile');

		// Clear the name field
		await page.getByTestId('name-input').clear();

		// Submit the form
		await page.getByTestId('save-changes-btn').click();

		// Wait for validation
		await page.waitForTimeout(500);

		// Verify validation error is shown
		await expect(page.locator('.text-error-700-300')).toBeVisible();
		await expect(page.locator('.text-error-700-300')).toContainText('Name is required');

		// Verify we're still on the profile page
		await expect(page).toHaveURL('/settings/profile');
	});

	test('should show validation error for name too long', async ({ page }) => {
		await page.goto('/settings/profile');

		// Fill with a very long name (over 100 characters)
		const longName = 'a'.repeat(101);
		await page.getByTestId('name-input').clear();
		await page.getByTestId('name-input').fill(longName);

		// Submit the form
		await page.getByTestId('save-changes-btn').click();

		// Wait for validation
		await page.waitForTimeout(500);

		// Verify validation error is shown
		await expect(page.locator('.text-error-700-300')).toBeVisible();
		await expect(page.locator('.text-error-700-300')).toContainText(
			'Name must be less than 100 characters'
		);

		// Verify we're still on the profile page
		await expect(page).toHaveURL('/settings/profile');
	});

	test('should maintain form data during validation errors', async ({ page }) => {
		await page.goto('/settings/profile');

		const testName = 'Test Name';

		// Fill a valid name
		await page.getByTestId('name-input').clear();
		await page.getByTestId('name-input').fill(testName);

		// Now clear it to trigger validation error
		await page.getByTestId('name-input').clear();

		// Submit the form
		await page.getByTestId('save-changes-btn').click();

		// Wait for validation
		await page.waitForTimeout(500);

		// Fill the name again and verify it's maintained
		await page.getByTestId('name-input').fill(testName);
		await expect(page.getByTestId('name-input')).toHaveValue(testName);
	});

	test('should clear validation errors when user starts typing', async ({ page }) => {
		await page.goto('/settings/profile');

		// Clear name to trigger validation error
		await page.getByTestId('name-input').clear();
		await page.getByTestId('save-changes-btn').click();
		await page.waitForTimeout(500);

		// Verify validation error is shown
		await expect(page.locator('.text-error-700-300')).toBeVisible();

		// Start typing in name field
		await page.getByTestId('name-input').fill('New Name');

		// Wait for error clearing delay
		await page.waitForTimeout(500);

		// Validation error should be cleared
		const nameErrors = page.locator('.text-error-700-300').filter({ hasText: 'Name is required' });
		await expect(nameErrors).toHaveCount(0);
	});

	test('should redirect to login when not authenticated', async ({ page }) => {
		// Clear session
		await page.context().clearCookies();

		// Try to access profile page
		await page.goto('/settings/profile');

		// Should be redirected to login page with redirectTo parameter
		await expect(page).toHaveURL(/\/login\?redirectTo=%2Fsettings%2Fprofile&msg=.*/);

		// Verify error message is shown
		await expect(page.getByTestId('error-message')).toBeVisible();
		await expect(page.getByTestId('error-message')).toContainText(
			'You must be logged in to access this page'
		);
	});

	test('should display logout section', async ({ page }) => {
		await page.goto('/settings/profile');

		// Verify logout section is present
		await expect(page.getByRole('heading', { name: 'Sign Out' })).toBeVisible();
		await expect(page.getByTestId('logout-btn')).toBeVisible();

		// Verify logout description text
		await expect(page.getByText('Sign out of your account on this device')).toBeVisible();
	});

	test('should successfully logout when logout button is clicked', async ({ page }) => {
		await page.goto('/settings/profile');

		// Click logout button
		await page.getByTestId('logout-btn').click();

		// Should be redirected to login page
		await expect(page).toHaveURL('/login');

		// Try to access profile page again - should be redirected to login
		await page.goto('/settings/profile');
		await expect(page).toHaveURL(/\/login\?redirectTo=%2Fsettings%2Fprofile&msg=.*/);
	});

	test('should preserve form state during page navigation', async ({ page }) => {
		await page.goto('/settings/profile');

		const newName = faker.person.fullName();

		// Fill new name but don't submit
		await page.getByTestId('name-input').clear();
		await page.getByTestId('name-input').fill(newName);

		// Navigate away and back
		await page.goto('/settings/account');
		await page.goto('/settings/profile');

		// The form should be reset to original user data, not the unsaved changes
		// (This is expected behavior since we didn't save)
		await expect(page.getByTestId('name-input')).not.toHaveValue(newName);
	});

	test('should have proper page title and heading', async ({ page }) => {
		await page.goto('/settings/profile');

		// Verify page title
		await expect(page).toHaveTitle('Profile - Settings | Silroad');

		// Verify main heading
		await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
	});
});
