import { eq } from 'drizzle-orm';
import { getDb, getLogger } from '$lib/db';
import { users } from '$lib/db/schema';
import { comparePassword, hashPassword } from '$lib/utils/crypto';

export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
};

export class UserRepo {
	private db;
	private logger;
	private platform;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.logger = getLogger(platform);
		this.platform = platform;
	}

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
			this.logger.writeDataPoint({
				blobs: ['error', 'UserRepo', 'getByEmail', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}

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
			this.logger.writeDataPoint({
				blobs: ['error', 'UserRepo', 'create', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}

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
			this.logger.writeDataPoint({
				blobs: ['error', 'UserRepo', 'verify', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}

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

			return updatedUser ?? null;
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'UserRepo', 'update', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}
	async delete(userId: string): Promise<void> {
		try {
			await this.db.delete(users).where(eq(users.id, userId));
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'UserRepo', 'delete', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
		}
	}
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
			const { SessionRepo } = await import('./session');
			const sessionRepo = new SessionRepo(this.platform);
			await sessionRepo.deleteByUserId(userId);

			return true;
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'UserRepo', 'updatePassword', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return false;
		}
	}
}
