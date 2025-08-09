import { getDb, getKV, getLogger } from '$lib/db';
import { generateSessionToken } from '$lib/utils/crypto';
import { and, eq, gt } from 'drizzle-orm';
import { sessions, users } from '$lib/db/schema';
import type { User } from './user';

export const SESSION_COOKIE_NAME = 'session';

export type SerializableSession = {
	userId: string;
	userEmail: string;
	userName: string;
	userImage: string | null;
	sessionExpiresAt: string;
};

export class SessionRepo {
	private db;
	private kv;
	private logger;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.kv = getKV(platform);
		this.logger = getLogger(platform);
	}

	async getByToken(token: string): Promise<SerializableSession | null> {
		try {
			const now = new Date(Date.now());

			const kvSession = await this.kv.get(token);

			if (kvSession) {
				const parsed = JSON.parse(kvSession);

				if (new Date(parsed.sessionExpiresAt) <= now) {
					await this.kv.delete(token);
					return null;
				}
				return parsed;
			} else {
				const result = await this.db
					.select({
						userId: users.id,
						userEmail: users.email,
						userName: users.name,
						userImage: users.image,
						sessionExpiresAt: sessions.expires
					})
					.from(sessions)
					.innerJoin(users, eq(sessions.userId, users.id))
					.where(and(eq(sessions.sessionToken, token), gt(sessions.expires, now)))
					.limit(1);

				const session = result[0];
				if (!session) return null;

				return {
					userId: session.userId,
					userEmail: session.userEmail,
					userName: session.userName,
					userImage: session.userImage,
					sessionExpiresAt: new Date(session.sessionExpiresAt).toISOString()
				};
			}
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ["error", "SessionRepo", "getByToken", JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}

	async create({ id: userId, email, name, image }: User): Promise<{
		token: string;
		expiresAt: Date;
	} | null> {
		try {
			const token = generateSessionToken();
			const expires = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

			await this.db.insert(sessions).values({
				sessionToken: token,
				userId: userId,
				expires: new Date(expires)
			});

			const session: SerializableSession = {
				userId,
				userEmail: email,
				userName: name,
				userImage: image,
				sessionExpiresAt: new Date(expires).toISOString()
			};

			await this.kv.put(token, JSON.stringify(session));

			return {
				token,
				expiresAt: new Date(expires)
			};
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ["error", "SessionRepo", "create", JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			}); return null;
		}
	}

	async getByUserId(userId: string): Promise<SerializableSession[]> {
		throw 'not implemented';
	}
	async update(session: SerializableSession): Promise<SerializableSession> {
		throw 'not implemented';
	}
	async delete(sessionToken: string): Promise<void> {
		throw 'not implemented';
	}
	async deleteByUserId(userId: string): Promise<number> {
		throw 'not implemented';
	}
	async invalidate(sessionToken: string): Promise<void> {
		throw 'not implemented';
	}
	async refresh(sessionToken: string): Promise<SerializableSession> {
		throw 'not implemented';
	}
	async getExpired(before: Date): Promise<SerializableSession[]> {
		throw 'not implemented';
	}
	async deleteExpired(): Promise<number> {
		throw 'not implemented';
	}
}
