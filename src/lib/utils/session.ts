import { getDb, getKV } from '$lib/db';
import { and, eq, gt } from 'drizzle-orm';
import { sessions, users } from '$lib/db/schema';
import { Logger } from '$lib/utils/logger';
import type { SerializableSession } from '$lib/types';

export const SESSION_COOKIE_NAME = 'session';

/**
 * Gets session data by token from KV cache first, then database.
 * Automatically cleans up expired sessions.
 * @param platform - App platform
 * @param token - Session token
 * @returns Session data or null if not found/expired
 */
export async function getSessionByToken(
	platform: App.Platform | undefined,
	token: string
): Promise<SerializableSession | null> {
	const db = getDb(platform);
	const kv = getKV(platform);
	const logger = new Logger(platform);

	try {
		const now = new Date(Date.now());

		const kvSession = await kv.get(token);

		if (kvSession) {
			const parsed = JSON.parse(kvSession);

			if (new Date(parsed.sessionExpiresAt) <= now) {
				await kv.delete(token);
				return null;
			}
			return parsed;
		} else {
			const result = await db
				.select({
					userId: users.id,
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
				userImage: session.userImage,
				sessionExpiresAt: new Date(session.sessionExpiresAt).toISOString()
			};
		}
	} catch (error) {
		logger.error('Session Utils', 'getSessionByToken', error);
		return null;
	}
}

/**
 * Refreshes session expiration if it expires within 48 hours.
 * Extends expiration by 30 days and updates both database and KV cache.
 * @param platform - App platform
 * @param sessionToken - Session token to refresh
 * @param session - Current session data
 * @returns Refreshed session data or null if not found
 */
export async function refreshSession(
	platform: App.Platform | undefined,
	sessionToken: string,
	session: SerializableSession
): Promise<SerializableSession | null> {
	const db = getDb(platform);
	const kv = getKV(platform);
	const logger = new Logger(platform);

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

		const [updatedSession] = await db
			.update(sessions)
			.set({ expires: newExpiry })
			.where(eq(sessions.sessionToken, sessionToken))
			.returning();

		if (!updatedSession) {
			return null;
		}

		const refreshedSession: SerializableSession = {
			userId: session.userId,
			userImage: session.userImage,
			sessionExpiresAt: newExpiry.toISOString()
		};

		await kv.put(sessionToken, JSON.stringify(refreshedSession));

		return refreshedSession;
	} catch (error) {
		logger.error('Session Utils', 'refreshSession', error);
		return null;
	}
}
