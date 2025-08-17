import { eq } from 'drizzle-orm';
import { getDb } from '$lib/db';
import { users } from '$lib/db/schema';
import { comparePassword, hashPassword } from '$lib/utils/crypto';
import { Logger } from '$lib/utils/logger';
import { SessionRepo } from './session';

/**
 * Represents a user entity.
 */
export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
};

/**
 * Repository for user CRUD operations and authentication.
 */
export class UserRepo {
	private db;
	private logger;
	private sessionRepo;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.logger = new Logger(platform);
		this.sessionRepo = new SessionRepo(platform);
	}

	/**
	 * Gets a user by their UUID.
	 * @param id - User UUID
	 * @returns The user (without password/salt), or null if not found or error
	 */
	async getById(id: string): Promise<User | null> {
		try {
			const result = await this.db
				.select({
					id: users.id,
					email: users.email,
					name: users.name,
					image: users.image
				})
				.from(users)
				.where(eq(users.id, id))
				.limit(1);

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('UserRepo', 'getById', JSON.stringify(error));
			return null;
		}
	}

	/**
	 * Gets a user by their email address.
	 * @param email - User email address
	 * @returns The user (without password/salt), or null if not found or error
	 */
	async getByEmail(email: string): Promise<User | null> {
		try {
			const result = await this.db
				.select({
					id: users.id,
					email: users.email,
					name: users.name,
					image: users.image
				})
				.from(users)
				.where(eq(users.email, email))
				.limit(1);

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('UserRepo', 'getByEmail', JSON.stringify(error));
			return null;
		}
	}

	/**
	 * Creates a new user with hashed password.
	 * @param email - User email address (must be unique)
	 * @param name - User display name
	 * @param hashedPassword - Pre-hashed password
	 * @param salt - Password salt used for hashing
	 * @returns The created user (without password/salt), or null on error
	 */
	async create(
		email: string,
		name: string,
		hashedPassword: string,
		salt: string
	): Promise<User | null> {
		try {
			const [user] = await this.db
				.insert(users)
				.values({
					email,
					name,
					password: hashedPassword,
					salt,
					image: null
				})
				.returning();

			return {
				id: user.id,
				email,
				name,
				image: null
			};
		} catch (error) {
			this.logger.error('UserRepo', 'create', JSON.stringify(error));
			return null;
		}
	}

	/**
	 * Verifies user credentials for authentication.
	 * @param inputEmail - Email address to verify
	 * @param inputPassword - Plain text password to verify
	 * @returns The user (without password/salt) if credentials are valid, null otherwise
	 */
	async verify(inputEmail: string, inputPassword: string): Promise<User | null> {
		try {
			const user = await this.db.select().from(users).where(eq(users.email, inputEmail));

			if (user.length === 0) {
				return null;
			}

			const { email, id, image, name, password, salt } = user[0];

			const validPass = await comparePassword(inputPassword, salt, password);

			if (!validPass) {
				return null;
			}

			return {
				id,
				email,
				name,
				image
			};
		} catch (error) {
			this.logger.error('UserRepo', 'verify', JSON.stringify(error));
			return null;
		}
	}

	/**
	 * Updates user profile information.
	 * @param user - User data to update (name and email)
	 * @returns The updated user, or null if not found or error
	 */
	async update(user: User): Promise<User | null> {
		try {
			const [updatedUser] = await this.db
				.update(users)
				.set({
					name: user.name,
					email: user.email
				})
				.where(eq(users.id, user.id))
				.returning({
					id: users.id,
					email: users.email,
					name: users.name,
					image: users.image
				});

			if (updatedUser) {
				// No need to update session since we no longer cache user data there
			}
			return updatedUser ?? null;
		} catch (error) {
			this.logger.error('UserRepo', 'update', JSON.stringify(error));
			return null;
		}
	}
	/**
	 * Deletes a user by their UUID.
	 * @param userId - User UUID to delete
	 */
	async delete(userId: string): Promise<void> {
		try {
			await this.db.delete(users).where(eq(users.id, userId));
		} catch (error) {
			this.logger.error('UserRepo', 'delete', JSON.stringify(error));
		}
	}
	/**
	 * Updates a user's password after verifying the old password.
	 * Invalidates all existing sessions for security.
	 * @param userId - User UUID
	 * @param oldPass - Current password for verification
	 * @param newPass - New password to set
	 * @returns true if password was updated successfully, false otherwise
	 */
	async updatePassword(userId: string, oldPass: string, newPass: string): Promise<boolean> {
		try {
			const user = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);

			if (user.length === 0) {
				return false;
			}

			const { password, salt } = user[0];
			const validOldPass = await comparePassword(oldPass, salt, password);

			if (!validOldPass) {
				return false;
			}

			const newHashedPassword = await hashPassword(newPass, salt);

			await this.db.update(users).set({ password: newHashedPassword }).where(eq(users.id, userId));

			// Invalidate all existing sessions for security
			await this.sessionRepo.deleteByUserId(userId);

			return true;
		} catch (error) {
			this.logger.error('UserRepo', 'updatePassword', JSON.stringify(error));
			return false;
		}
	}
}
