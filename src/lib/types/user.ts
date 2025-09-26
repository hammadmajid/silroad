/**
 * User subscription plan types
 */
export type UserPlan = 'free' | 'premium';

/**
 * Plan configuration and features
 */
export type PlanConfig = {
	name: string;
	price: number;
	description: string;
	features: string[];
	canCreateOrganization: boolean;
};

/**
 * Represents a user entity.
 *
 * @property id - Unique identifier for the user.
 * @property email - Email address of the user.
 * @property name - Display name of the user.
 * @property image - URL to the user's profile image, or null if not set.
 * @property plan - User's current subscription plan.
 */
export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
	plan: UserPlan;
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
