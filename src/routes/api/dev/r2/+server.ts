import { error, json } from '@sveltejs/kit';
import { getBucket } from '$lib/db/index.js';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ platform }: RequestEvent) {
	try {
		const bucket = getBucket(platform);

		const testData = {
			message: 'Test R2 upload',
			timestamp: new Date().toISOString(),
			randomData: Math.random().toString(36),
			environment: 'development',
			testId: crypto.randomUUID()
		};

		const blob = JSON.stringify(testData, null, 2);
		const uniqueKey = `test-${Date.now()}-${Math.random().toString(36).substring(2)}.json`;

		const obj = await bucket.put(uniqueKey, blob, {
			httpMetadata: {
				contentType: 'application/json'
			}
		});


		const metadata = {
			success: true,
			r2ObjectKey: uniqueKey,
			dataSize: blob.length,
			contentType: 'application/json',
			uploadTimestamp: testData.timestamp,
			bucketUrl: `https://static.silroad.space/${uniqueKey}`,
			testData,
			obj
		};

		return json(metadata);

	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		console.error('R2 upload error:', err);
		throw error(500, 'Upload failed');
	}
}
