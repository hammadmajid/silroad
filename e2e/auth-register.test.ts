import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('User Registration Flow', () => {
    test('should complete full registration flow from home page', async ({ page }) => {
        // Generate unique test data to avoid conflicts
        const testUser = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: 'TestPass123' // Meets validation: 8+ chars with letters and numbers
        };

        // Start at home page
        await page.goto('/');

        // Verify we're on the home page
        await expect(page.getByRole('heading', { name: 'Welcome to Silroad' })).toBeVisible();

        // Click "Get Started" to navigate to registration
        await page.getByTestId('get-started-btn').click();

        // Verify we're on the registration page
        await expect(page).toHaveURL('/register');

        // Fill out the registration form
        await page.getByTestId('first-name-input').fill(testUser.firstName);
        await page.getByTestId('last-name-input').fill(testUser.lastName);
        await page.getByTestId('email-input').fill(testUser.email);
        await page.getByTestId('password-input').fill(testUser.password);

        // Accept terms and privacy policy
        await page.getByTestId('terms-checkbox').check();

        // Submit the form
        await page.getByTestId('register-submit-btn').click();

        // Verify successful registration and redirect to explore page
        await expect(page).toHaveURL('/explore');
    });

    test('should show validation errors for invalid form data', async ({ page }) => {
        await page.goto('/register');

        // Try to submit form with invalid data
        await page.getByTestId('first-name-input').fill('');
        await page.getByTestId('last-name-input').fill('A'); // Valid
        await page.getByTestId('email-input').fill('invalid-email');
        await page.getByTestId('password-input').fill('weak'); // Doesn't meet requirements

        // Don't check the terms checkbox to trigger validation error
        await page.getByTestId('register-submit-btn').click();

        // Wait a bit for validation to process
        await page.waitForTimeout(500);

        // Verify validation errors are shown - there should be error elements present
        await expect(page.locator('.text-error-700-300')).toHaveCount(5);

        // Verify we're still on the registration page (form didn't submit due to validation errors)
        await expect(page).toHaveURL('/register');
    });

    test('should show error when trying to register with existing email', async ({ page, browser }) => {
        // Use a common email that might already exist in test data
        const existingUser = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'TestPass123'
        };

        await page.goto('/register');

        // Fill form with existing email
        await page.getByTestId('first-name-input').fill(existingUser.firstName);
        await page.getByTestId('last-name-input').fill(existingUser.lastName);
        await page.getByTestId('email-input').fill(existingUser.email);
        await page.getByTestId('password-input').fill(existingUser.password);
        await page.getByTestId('terms-checkbox').check();

        // First registration attempt
        await page.getByTestId('register-submit-btn').click();

        // If this email doesn't exist, it will succeed and redirect to /explore
        // If it exists, we should see an error message
        await page.waitForLoadState('networkidle');

        // Check if we're on explore (successful registration) or still on register (error)
        const currentUrl = page.url();
        if (currentUrl.includes('/explore')) {
            // Cclear the sesion cookie fist
            await page.context().clearCookies();

            // First registration was successful, now try to register again with same email
            await page.goto('/register');
            await page.getByTestId('first-name-input').fill('Another');
            await page.getByTestId('last-name-input').fill('User');
            await page.getByTestId('email-input').fill(existingUser.email);
            await page.getByTestId('password-input').fill('AnotherPass123');
            await page.getByTestId('terms-checkbox').check();
            await page.getByTestId('register-submit-btn').click();

            // Should show error for duplicate email
            await expect(page.getByTestId('error-message')).toBeVisible();
            await expect(page).toHaveURL('/register');
        }
    });

    test('should handle loading states during registration', async ({ page }) => {
        // Generate unique test data
        const testUser = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: 'TestPass123'
        };

        await page.goto('/register');

        // Fill the form
        await page.getByTestId('first-name-input').fill(testUser.firstName);
        await page.getByTestId('last-name-input').fill(testUser.lastName);
        await page.getByTestId('email-input').fill(testUser.email);
        await page.getByTestId('password-input').fill(testUser.password);
        await page.getByTestId('terms-checkbox').check();

        // Submit and verify loading state
        const submitButton = page.getByTestId('register-submit-btn');
        await submitButton.click();

        // The button should be disabled during submission
        await expect(submitButton).toBeDisabled();

        // Eventually should redirect to explore
        await expect(page).toHaveURL('/explore', { timeout: 10000 });
    });

    test('should redirect authenticated users away from registration page', async ({ page, context }) => {
        // First, register a user to get authenticated
        const testUser = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.internet.email(),
            password: 'TestPass123'
        };

        await page.goto('/register');
        await page.getByTestId('first-name-input').fill(testUser.firstName);
        await page.getByTestId('last-name-input').fill(testUser.lastName);
        await page.getByTestId('email-input').fill(testUser.email);
        await page.getByTestId('password-input').fill(testUser.password);
        await page.getByTestId('terms-checkbox').check();
        await page.getByTestId('register-submit-btn').click();

        // Should be redirected to explore
        await expect(page).toHaveURL('/explore');

        // Now try to access registration page while authenticated
        await page.goto('/register');

        // Should be redirected back to explore since user is already authenticated
        await expect(page).toHaveURL('/explore');
    });
});
