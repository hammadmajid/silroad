import { browser } from '$app/environment';

export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
};

const USER_COOKIE_NAME = 'user_data';

function createUserStore() {
	let user = $state<User | null>(null);

	// Initialize user from cookie when in browser
	if (browser) {
		const userData = getCookieValue(USER_COOKIE_NAME);
		if (userData) {
			try {
				user = JSON.parse(userData);
			} catch (e) {
				console.error('Failed to parse user data from cookie:', e);
				clearUserCookie();
			}
		}
	}

	function setUser(userData: User) {
		user = userData;
		if (browser) {
			setUserCookie(userData);
		}
	}

	function clearUser() {
		user = null;
		if (browser) {
			clearUserCookie();
		}
	}

	function setUserCookie(userData: User) {
		const expires = new Date();
		expires.setDate(expires.getDate() + 30); // 30 days

		document.cookie = `${USER_COOKIE_NAME}=${JSON.stringify(userData)}; path=/; expires=${expires.toUTCString()}; secure; samesite=strict`;
	}

	function clearUserCookie() {
		document.cookie = `${USER_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
	}

	function getCookieValue(name: string): string | null {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			const cookieValue = parts.pop()?.split(';').shift();
			return cookieValue || null;
		}
		return null;
	}

	return {
		get current() {
			return user;
		},
		get isLoggedIn() {
			return user !== null;
		},
		setUser,
		clearUser
	};
}

export const userStore = createUserStore();
