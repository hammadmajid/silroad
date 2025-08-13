import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';

// Manual localStorage implementation for theme persistence
function createThemeStore() {
	let subscribers: Array<(value: ThemeMode) => void> = [];
	let value: ThemeMode = 'system';

	// Load from localStorage on initialization
	if (browser) {
		const stored = localStorage.getItem('theme-mode');
		if (stored && ['light', 'dark', 'system'].includes(stored)) {
			value = stored as ThemeMode;
		}
	}

	return {
		subscribe(fn: (value: ThemeMode) => void) {
			subscribers.push(fn);
			fn(value);
			return () => {
				subscribers = subscribers.filter((sub) => sub !== fn);
			};
		},
		set(newValue: ThemeMode) {
			value = newValue;
			if (browser) {
				localStorage.setItem('theme-mode', newValue);
			}
			subscribers.forEach((fn) => fn(value));
		},
		get: () => value
	};
}

export const themeMode = createThemeStore();

/**
 * Apply the theme to the document
 */
function applyTheme(mode: ThemeMode) {
	if (!browser) return;

	const html = document.documentElement;

	if (mode === 'system') {
		// Remove explicit mode and let system preference take over
		html.removeAttribute('data-mode');
		// Check system preference
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		html.setAttribute('data-mode', prefersDark ? 'dark' : 'light');
	} else {
		// Set explicit mode
		html.setAttribute('data-mode', mode);
	}
}

/**
 * Initialize theme management
 */
export function initTheme() {
	if (!browser) return;

	// Apply initial theme
	applyTheme(themeMode.get());

	// Subscribe to theme changes
	themeMode.subscribe(applyTheme);

	// Listen for system theme changes when in system mode
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', () => {
		if (themeMode.get() === 'system') {
			applyTheme('system');
		}
	});
}

/**
 * Set theme mode
 */
export function setThemeMode(mode: ThemeMode) {
	themeMode.set(mode);
}

/**
 * Get current effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(): 'light' | 'dark' {
	if (!browser) return 'light';

	const html = document.documentElement;
	const currentMode = html.getAttribute('data-mode');
	return currentMode === 'dark' ? 'dark' : 'light';
}
