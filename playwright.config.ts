import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'NODE_ENV=test pnpm run build && NODE_ENV=test pnpm run preview',
		port: 8787
	},
	testDir: 'tests/e2e',
	globalSetup: './tests/e2e/global-setup.ts'
});
