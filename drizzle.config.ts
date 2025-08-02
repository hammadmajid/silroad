import { defineConfig } from 'drizzle-kit';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_TOKEN;

if (!accountId) {
	throw new Error("CLOUDFLARE_ACCOUNT_ID is undefined");
}

if (!token) {
	throw new Error("CLOUDFLARE_TOKEN is undefined");
}

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/db/schema.ts',
	driver: 'd1-http',
	dbCredentials: {
		accountId,
		databaseId: "593db8b3-fa2d-452b-92db-ac7c7d3f4659",
		token,
	},
	tablesFilter: ["!_cf_KV"]
});
