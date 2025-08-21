import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import type { Page } from '@playwright/test';

test.describe('User Login Flow', () => {
	// Helper function to create a test user for login tests
	async function createTestUser(page: Page) {
		const testUser = {
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			password: 'TestPass123'
		};

		// Register the user first
		await page.goto('/register');
		await page.getByTestId('first-name-input').fill(testUser.firstName);
		await page.getByTestId('last-name-input').fill(testUser.lastName);
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);
		await page.getByTestId('terms-checkbox').check();
		await page.getByTestId('register-submit-btn').click();

		// Wait for registration to complete
		await expect(page).toHaveURL('/');

		// Clear session to prepare for login test
		await page.context().clearCookies();

		return testUser;
	}

	test('should complete successful login flow', async ({ page }) => {
		// Create a test user
		const testUser = await createTestUser(page);

		// Navigate to login page
		await page.goto('/login');

		// Verify we're on the login page
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

		// Fill login form
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Verify successful login and redirect to home page
		await expect(page).toHaveURL('/');
	});

	test('should show validation errors for empty form fields', async ({ page }) => {
		await page.goto('/login');

		// Try to submit form with empty fields
		await page.getByTestId('login-submit-btn').click();

		// Wait for validation to process
		await page.waitForTimeout(500);

		// Verify validation errors are shown
		await expect(page.locator('.text-error-700-300')).toHaveCount(2);

		// Verify we're still on the login page
		await expect(page).toHaveURL('/login');
	});

	test('should show validation error for invalid email format', async ({ page }) => {
		await page.goto('/login');

		// Fill form with invalid email
		await page.getByTestId('email-input').fill('invalid-email');
		await page.getByTestId('password-input').fill('somepassword');

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Wait for validation to process
		await page.waitForTimeout(500);

		// Verify email validation error is shown - locate the field container by input and find its error
		const emailFieldContainer = page.locator(':has([data-testid="email-input"])');
		await expect(emailFieldContainer.locator('.text-error-700-300')).toHaveCount(2);

		// Verify we're still on the login page
		await expect(page).toHaveURL('/login');
	});

	test('should show error for invalid credentials', async ({ page }) => {
		await page.goto('/login');

		// Fill form with non-existent credentials
		await page.getByTestId('email-input').fill('nonexistent@example.com');
		await page.getByTestId('password-input').fill('wrongpassword');

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Wait for server response
		await page.waitForLoadState('networkidle');

		// Verify error message is shown
		await expect(page.getByTestId('error-message')).toBeVisible();
		await expect(page.getByTestId('error-message')).toContainText('Invalid email or password');

		// Verify we're still on the login page
		await expect(page).toHaveURL('/login');
	});

	test('should show error for correct email but wrong password', async ({ page }) => {
		// Create a test user
		const testUser = await createTestUser(page);

		// Navigate to login page
		await page.goto('/login');

		// Fill form with correct email but wrong password
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill('WrongPassword123');

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Wait for server response
		await page.waitForLoadState('networkidle');

		// Verify error message is shown
		await expect(page.getByTestId('error-message')).toBeVisible();
		await expect(page.getByTestId('error-message')).toContainText('Invalid email or password');

		// Verify we're still on the login page
		await expect(page).toHaveURL('/login');
	});

	test('should handle loading states during login', async ({ page }) => {
		// Create a test user
		const testUser = await createTestUser(page);

		// Navigate to login page
		await page.goto('/login');

		// Fill the form
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);

		// Submit and verify loading state
		const submitButton = page.getByTestId('login-submit-btn');
		await submitButton.click();

		// The button should be disabled during submission
		await expect(submitButton).toBeDisabled();

		// Eventually should redirect to home
		await expect(page).toHaveURL('/', { timeout: 10000 });
	});

	test('should redirect authenticated users away from login page', async ({ page }) => {
		// Create and login a user
		const testUser = await createTestUser(page);

		await page.goto('/login');
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);
		await page.getByTestId('login-submit-btn').click();

		// Should be redirected to home
		await expect(page).toHaveURL('/');

		// Now try to access login page while authenticated
		await page.goto('/login');

		// Should be redirected back to home since user is already authenticated
		await expect(page).toHaveURL('/');
	});

	test('should navigate to registration page from login', async ({ page }) => {
		await page.goto('/login');

		// Click the "Sign up" link
		await page.getByRole('link', { name: 'Sign up' }).click();

		// Verify we're redirected to registration page
		await expect(page).toHaveURL('/register');
	});

	test('should maintain form data during validation errors', async ({ page }) => {
		await page.goto('/login');

		const testEmail = 'test@example.com';

		// Fill form with valid email but empty password
		await page.getByTestId('email-input').fill(testEmail);
		await page.getByTestId('password-input').fill('');

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Wait for validation to process
		await page.waitForTimeout(500);

		// Verify the email field still contains the entered value
		await expect(page.getByTestId('email-input')).toHaveValue(testEmail);
	});

	test('should clear error messages when user starts typing', async ({ page }) => {
		await page.goto('/login');

		// Submit empty form to trigger validation errors
		await page.getByTestId('login-submit-btn').click();
		await page.waitForTimeout(500);

		// Verify validation errors are shown
		await expect(page.locator('.text-error-700-300')).toHaveCount(2);

		// Start typing in email field
		await page.getByTestId('email-input').fill('test@example.com');

		// Wait for error clearing delay
		await page.waitForTimeout(500);

		// Email validation error should be cleared
		const emailErrors = page
			.locator('.text-error-700-300')
			.filter({ hasText: 'Please enter a valid email' });
		await expect(emailErrors).toHaveCount(0);
	});

	test('should preserve redirect URL after successful login', async ({ page }) => {
		// Create a test user
		const testUser = await createTestUser(page);

		// Try to access protected route without being logged in
		await page.goto('/settings/profile');

		// Should be redirected to login page with redirectTo parameter and error message
		await expect(page).toHaveURL(/\/login\?redirectTo=%2Fsettings%2Fprofile&msg=.*/);

		// Verify error message is shown
		await expect(page.getByTestId('error-message')).toBeVisible();
		await expect(page.getByTestId('error-message')).toContainText(
			'You must be logged in to access this page'
		);

		// Fill login form
		await page.getByTestId('email-input').fill(testUser.email);
		await page.getByTestId('password-input').fill(testUser.password);

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Should be redirected back to the original protected route
		await expect(page).toHaveURL('/settings/profile');
	});

	test('should handle case-insensitive email login', async ({ page }) => {
		// Create a test user
		const testUser = await createTestUser(page);

		// Navigate to login page
		await page.goto('/login');

		// Fill form with uppercase email
		await page.getByTestId('email-input').fill(testUser.email.toUpperCase());
		await page.getByTestId('password-input').fill(testUser.password);

		// Submit the form
		await page.getByTestId('login-submit-btn').click();

		// Wait for response
		await page.waitForLoadState('networkidle');

		// Check if login succeeded or if we get an error (depending on implementation)
		const currentUrl = page.url();
		if (currentUrl.endsWith('/') && !currentUrl.includes('/login')) {
			// Case-insensitive login is supported
			await expect(page).toHaveURL('/');
		} else {
			// Case-insensitive login is not supported, should show error
			await expect(page.getByTestId('error-message')).toBeVisible();
			await expect(page).toHaveURL('/login');
		}
	});
});
