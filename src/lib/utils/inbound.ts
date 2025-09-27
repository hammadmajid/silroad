import { Inbound } from '@inboundemail/sdk';

export function getInbound(platform: App.Platform | undefined): Inbound {
	const key = platform?.env.INBOUND_API_KEY;

	if (!key) {
		throw 'Missing Inbound API Key';
	}

	return new Inbound(key);
}
