import { eq } from 'drizzle-orm';
import { getDb, getLogger } from '$lib/db';
import { users } from '$lib/db/schema';
import { comparePassword } from '$lib/utils/crypto';

export type User = {
	id: string;
	email: string;
	name: string;
	image: string | null;
};

export class UserRepo {
	private db;
	private logger;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.logger = getLogger(platform);
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async update(user: User): Promise<User> {
		throw 'not implemented';
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async delete(userId: string): Promise<void> {
		throw 'not implemented';
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async updatePassword(oldPass: string, newPass: string): Promise<boolean> {
		throw 'not implemented';
	}
}
