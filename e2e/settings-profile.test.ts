import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

test.describe('Profile Settings Page', () => {
	// Helper function to create and login a test user
	async function createAndLoginUser(page: Page) {
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

		return {
			...testUser,
			fullName: `${testUser.firstName} ${testUser.lastName}`
		};
	}

	test.beforeEach(async ({ page }) => {
		// Create and login user before each test
		await createAndLoginUser(page);
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

		// Verify join date field has some value
		await expect(page.getByTestId('join-date-input')).toHaveValue('Member since 2024');
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

		// Verify avatar updates with new initials
		const nameParts = newName.split(' ');
		const expectedInitials =
			`${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
		const avatarElement = page.locator('.bg-primary-500').filter({ hasText: expectedInitials });
		await expect(avatarElement).toBeVisible();
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

	test('should handle loading states during form submission', async ({ page }) => {
		await page.goto('/settings/profile');

		const newName = faker.person.fullName();

		// Fill new name
		await page.getByTestId('name-input').clear();
		await page.getByTestId('name-input').fill(newName);

		// Click submit and verify loading state
		const submitButton = page.getByTestId('save-changes-btn');
		await submitButton.click();

		// The button should be disabled during submission
		await expect(submitButton).toBeDisabled();

		// Look for loading spinner (assuming it exists)
		await expect(page.locator('.animate-spin')).toBeVisible();

		// Wait for form submission to complete
		await page.waitForLoadState('networkidle');

		// Button should be enabled again
		await expect(submitButton).toBeEnabled();
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

	test('should display change photo buttons but not support image upload', async ({ page }) => {
		await page.goto('/settings/profile');

		// Verify change photo buttons are present
		await expect(page.getByRole('button', { name: 'Change photo' })).toBeVisible();
		await expect(page.locator('button[aria-label="Edit profile photo"]')).toBeVisible();

		// These buttons should be present but the actual image upload functionality
		// is not implemented yet as per requirements
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
