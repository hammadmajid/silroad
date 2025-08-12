import { getDb, getKV, getLogger } from '$lib/db';
import { generateSessionToken } from '$lib/utils/crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
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
				blobs: ['error', 'SessionRepo', 'getByToken', JSON.stringify(error)],
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
				blobs: ['error', 'SessionRepo', 'create', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}

	async getByUserId(userId: string): Promise<SerializableSession[]> {
		try {
			const now = new Date(Date.now());

			const userSessions = await this.db
				.select({
					sessionToken: sessions.sessionToken,
					userId: sessions.userId,
					userEmail: users.email,
					userName: users.name,
					userImage: users.image,
					sessionExpiresAt: sessions.expires
				})
				.from(sessions)
				.innerJoin(users, eq(sessions.userId, users.id))
				.where(and(eq(sessions.userId, userId), gt(sessions.expires, now)));

			return userSessions.map((session) => ({
				userId: session.userId,
				userEmail: session.userEmail,
				userName: session.userName,
				userImage: session.userImage,
				sessionExpiresAt: new Date(session.sessionExpiresAt).toISOString()
			}));
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'getByUserId', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return [];
		}
	}
	async update(session: SerializableSession): Promise<SerializableSession | null> {
		try {
			const sessionToken = await this.db
				.select({ sessionToken: sessions.sessionToken })
				.from(sessions)
				.where(eq(sessions.userId, session.userId))
				.limit(1);

			if (!sessionToken[0]) {
				return null;
			}

			await this.kv.put(sessionToken[0].sessionToken, JSON.stringify(session));
			return session;
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'update', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}
	async delete(sessionToken: string): Promise<void> {
		try {
			await this.db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
			await this.kv.delete(sessionToken);
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'delete', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
		}
	}
	async deleteByUserId(userId: string): Promise<number> {
		try {
			const userSessions = await this.db
				.select({ sessionToken: sessions.sessionToken })
				.from(sessions)
				.where(eq(sessions.userId, userId));

			await this.db.delete(sessions).where(eq(sessions.userId, userId));

			for (const session of userSessions) {
				await this.kv.delete(session.sessionToken);
			}

			return userSessions.length;
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'deleteByUserId', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return 0;
		}
	}
	async invalidate(sessionToken: string): Promise<void> {
		try {
			await this.db
				.update(sessions)
				.set({ expires: new Date(Date.now() - 1000) })
				.where(eq(sessions.sessionToken, sessionToken));
			await this.kv.delete(sessionToken);
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'invalidate', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
		}
	}
	async refresh(
		sessionToken: string,
		session: SerializableSession
	): Promise<SerializableSession | null> {
		try {
			const now = Date.now();
			const sessionExpiry = new Date(session.sessionExpiresAt).getTime();
			const hoursUntilExpiry = (sessionExpiry - now) / (1000 * 60 * 60);

			// Only refresh if session expires within 48 hours
			if (hoursUntilExpiry > 48) {
				return session;
			}

			const expires = now + 1000 * 60 * 60 * 24 * 30; // 30 days
			const newExpiry = new Date(expires);

			const [updatedSession] = await this.db
				.update(sessions)
				.set({ expires: newExpiry })
				.where(eq(sessions.sessionToken, sessionToken))
				.returning();

			if (!updatedSession) {
				return null;
			}

			const refreshedSession: SerializableSession = {
				userId: session.userId,
				userEmail: session.userEmail,
				userName: session.userName,
				userImage: session.userImage,
				sessionExpiresAt: newExpiry.toISOString()
			};

			await this.kv.put(sessionToken, JSON.stringify(refreshedSession));

			return refreshedSession;
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'refresh', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return null;
		}
	}
	async getExpired(before: Date): Promise<SerializableSession[]> {
		try {
			const expiredSessions = await this.db
				.select({
					userId: users.id,
					userEmail: users.email,
					userName: users.name,
					userImage: users.image,
					sessionExpiresAt: sessions.expires
				})
				.from(sessions)
				.innerJoin(users, eq(sessions.userId, users.id))
				.where(and(lt(sessions.expires, before)));

			return expiredSessions.map((session) => ({
				userId: session.userId,
				userEmail: session.userEmail,
				userName: session.userName,
				userImage: session.userImage,
				sessionExpiresAt: new Date(session.sessionExpiresAt).toISOString()
			}));
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'getExpired', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return [];
		}
	}
	async deleteExpired(): Promise<number> {
		try {
			const now = new Date(Date.now());

			const expiredSessions = await this.db
				.select({ sessionToken: sessions.sessionToken })
				.from(sessions)
				.where(and(lt(sessions.expires, now)));

			await this.db.delete(sessions).where(and(lt(sessions.expires, now)));

			for (const session of expiredSessions) {
				await this.kv.delete(session.sessionToken);
			}

			return expiredSessions.length;
		} catch (error) {
			this.logger.writeDataPoint({
				blobs: ['error', 'SessionRepo', 'deleteExpired', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
			return 0;
		}
	}
}
