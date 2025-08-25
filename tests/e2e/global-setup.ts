import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
	// Get the base URL from the webServer configuration
	const baseURL = `http://localhost:${config.webServer?.port || 8787}`;

	console.log('🌱 Seeding database for E2E tests...');

	try {
		const response = await fetch(`${baseURL}/api/dev/seed`, {
			method: 'POST'
		});

		if (!response.ok) {
			throw new Error(`Seed request failed with status: ${response.status}`);
		}

		console.log('✅ Database seeded successfully');
	} catch (error) {
		console.error('❌ Failed to seed database:', error);
		throw error;
	}
}

export default globalSetup;
