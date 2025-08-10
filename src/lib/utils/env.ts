export function isProduction(platform: App.Platform | undefined): boolean {
	return platform?.env.NODE_ENV === 'production';
}
