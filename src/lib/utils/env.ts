export function isProduction(platform: App.Platform | undefined): boolean {
	return platform?.env.NODE_ENV === 'production';
}

export function getPublicTurnstileKey(platform: App.Platform | undefined) {
	const key = platform?.env.PUBLIC_TURNSTILE_KEY;

	if (!key) {
		throw new Error('Turnstile public key not found');
	}

	return key;
}

export function getSecretTurnstileKey(platform: App.Platform | undefined) {
	const key = platform?.env.SECRET_TURNSTILE_KEY;

	if (!key) {
		throw new Error('Turnstile secret key not found');
	}

	return key;
}
