import { drizzle } from 'drizzle-orm/d1';
import { error } from '@sveltejs/kit';

export function getDb(platform: App.Platform | undefined) {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	if (!platform.env) {
		throw error(500, 'Environment not available');
	}

	if (!platform.env.DB) {
		throw error(500, 'Database not available');
	}

	return drizzle(platform.env.DB);
}

export function getKV(platform: App.Platform | undefined) {
	if (!platform) {
		throw error(500, 'Platform not available');
	}

	if (!platform.env) {
		throw error(500, 'Environment not available');
	}

	if (!platform.env.KV) {
		throw error(500, 'KV not available');
	}

	return platform.env.KV;
}
