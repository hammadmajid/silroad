export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
};

function createUserStore() {
	let user = $state<User | null>(null);

	function setUser(userData: User) {
		user = userData;
	}

	function clearUser() {
		user = null;
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
