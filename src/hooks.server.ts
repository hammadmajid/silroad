import { getDb } from '$lib/db';
import { sessions, users } from '$lib/db/schema';
import { type Handle } from '@sveltejs/kit';
import { eq, and, gt } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
    const sessionToken = event.cookies.get("session_token");

    if (!sessionToken) {
        return resolve(event);
    }

    // TODO: check KV cache fist

    const db = getDb(event.platform);

    const getValidUserBySessionToken = async (sessionToken: string) => {
        const now = new Date();

        const result = await db
            .select({
                userId: users.id,
                userName: users.name,
                userEmail: users.email,
                userEmailVerified: users.emailVerified,
                userImage: users.image,
                sessionExpires: sessions.expires,
            })
            .from(sessions)
            .innerJoin(users, eq(sessions.userId, users.id))
            .where(
                and(
                    eq(sessions.sessionToken, sessionToken),
                    gt(sessions.expires, now)
                )
            );

        return result.length > 0 ? result[0] : null;
    };

    const sessionData = await getValidUserBySessionToken(sessionToken);

    if (!sessionData) {
        // Invalid or expired session - just delete the cookie
        event.cookies.delete('session_token', { path: '/' });
        return resolve(event);
    }

    // Set user in locals for valid sessions
    event.locals.user = {
        id: sessionData.userId,
        name: sessionData.userName,
        email: sessionData.userEmail,
        image: sessionData.userImage
    };

    // TODO: extend session life if about to expire

    return resolve(event);
};

