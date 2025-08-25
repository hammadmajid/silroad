import { getLogger } from '$lib/db';

export class Logger {
	private logger;

	constructor(platform: App.Platform | undefined) {
		this.logger = getLogger(platform);
	}

	error(source: string, stub: string, error: unknown) {
		this.logger.writeDataPoint({
			blobs: ['error', source, stub, JSON.stringify(error)],
			doubles: [1],
			indexes: [crypto.randomUUID()]
		});
	}

	stat(path: string, action: string, meta?: unknown) {
		this.logger.writeDataPoint({
			blobs: ['stat', path, action, JSON.stringify(meta)],
			doubles: [1],
			indexes: [crypto.randomUUID()]
		});
	}
}
