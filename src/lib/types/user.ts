/**
 * Represents a user entity.
 *
 * @property id - Unique identifier for the user.
 * @property email - Email address of the user.
 * @property name - Display name of the user.
 * @property image - URL to the user's profile image, or null if not set.
 */
export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
	createdAt: Date;
};

/**
 * Session data that can be serialized and stored in KV.
 */
export type SerializableSession = {
	userId: string;
	userImage: string | null;
	sessionExpiresAt: string;
};
