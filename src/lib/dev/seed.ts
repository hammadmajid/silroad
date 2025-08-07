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
  opts: { users: number; sessions: number; organizations: number }
) {
  const db = getDb(platform);

  await db.delete(schema.users).run();
  await db.delete(schema.organizations).run();
  await db.delete(schema.sessions).run();
  await db.delete(schema.organizationMembers).run();
  await db.delete(schema.verificationTokens).run();

  const organizations: typeof schema.organizations.$inferInsert[] = [];

  for (let i = 0; i < opts.organizations; i++) {
    const id = crypto.randomUUID();
    const name = faker.company.name();
    organizations.push({
      id,
      name: name,
      slug: faker.helpers.slugify(name.toLowerCase()),
      description: faker.company.catchPhrase(),
      avatar: faker.image.avatar(),
      backgroundImage: faker.image.urlPicsumPhotos(),
    });
  }

  await db.insert(schema.organizations).values(organizations).run();

  const users: typeof schema.users.$inferInsert[] = [];

  for (let i = 0; i < opts.users; i++) {
    const id = crypto.randomUUID();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const image = faker.image.avatarGitHub();

    const org = i < opts.organizations ? organizations[i] : undefined;

    users.push({
      id,
      name,
      email,
      image,
      password: hashedPassword,
      salt,
      organizationId: org?.id || null,
    });
  }

  await db.insert(schema.users).values(users).run();

  const members: typeof schema.organizationMembers.$inferInsert[] = [];

  for (const user of users) {
    if (!user.organizationId) continue;
    members.push({
      userId: user.id!,
      organizationId: user.organizationId,
    });
  }

  await db.insert(schema.organizationMembers).values(members).run();

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
