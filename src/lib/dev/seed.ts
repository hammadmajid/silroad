import { faker } from '@faker-js/faker';
import { generateSalt, hashPassword, generateSessionToken } from '$lib/utils/crypto';
import * as schema from '$lib/db/schema';
import { getDb } from '$lib/db';

// prevent worker from hitting the CPU time limit
const password = 'Pass!234';
const salt = generateSalt();
const hashedPassword = await hashPassword(password, salt);

export async function seedDatabase(
  platform: App.Platform | undefined,
  opts: { users: number; sessions: number }
) {
  const db = getDb(platform);

  const users: typeof schema.users.$inferInsert[] = [];

  for (let i = 0; i < opts.users; i++) {
    const id = crypto.randomUUID();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const image = faker.image.avatarGitHub();

    users.push({
      id,
      name,
      email,
      image,
      password: hashedPassword,
      salt,
    });
  }

  await db.insert(schema.users).values(users).run();

  const sessions: typeof schema.sessions.$inferInsert[] = [];

  for (let i = 0; i < opts.sessions; i++) {
    const user = users[i % users.length];
    sessions.push({
      userId: user.id!,
      sessionToken: generateSessionToken(),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
    });
  }

  await db.insert(schema.sessions).values(sessions).run();
}
