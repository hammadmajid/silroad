import { faker } from '@faker-js/faker';
import {
  generateSalt,
  hashPassword,
  generateSessionToken
} from '$lib/utils/crypto';
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

  await clearDatabase(db);

  const organizations = await createOrganizations(db, opts.organizations);
  const users = await createUsers(db, opts.users, organizations);
  await assignOrganizationMembers(db, users, organizations);
  const events = await createEvents(db, organizations);
  await assignEventOrganizersAndAttendees(db, events, users);
  await createSessions(db, opts.sessions, users);
}

// ----------------------------

async function clearDatabase(db: ReturnType<typeof getDb>) {
  await db.delete(schema.attendees).run();
  await db.delete(schema.eventOrganizers).run();
  await db.delete(schema.events).run();
  await db.delete(schema.organizationMembers).run();
  await db.delete(schema.sessions).run();
  await db.delete(schema.verificationTokens).run();
  await db.delete(schema.users).run();
  await db.delete(schema.organizations).run();
}

// ----------------------------

async function createOrganizations(db: ReturnType<typeof getDb>, count: number) {
  const organizations: typeof schema.organizations.$inferInsert[] = [];

  for (let i = 0; i < count; i++) {
    const name = faker.company.name();
    organizations.push({
      id: crypto.randomUUID(),
      name,
      slug: faker.helpers.slugify(name.toLowerCase()),
      description: faker.company.catchPhrase(),
      avatar: faker.image.avatar(),
      backgroundImage: faker.image.urlPicsumPhotos()
    });
  }

  await db.insert(schema.organizations).values(organizations).run();
  return organizations;
}

// ----------------------------

async function createUsers(
  db: ReturnType<typeof getDb>,
  count: number,
  organizations: typeof schema.organizations.$inferInsert[]
) {
  const users: typeof schema.users.$inferInsert[] = [];

  for (let i = 0; i < count; i++) {
    const organization =
      faker.datatype.boolean() && organizations.length > 0
        ? faker.helpers.arrayElement(organizations)
        : undefined;

    users.push({
      id: crypto.randomUUID(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      image: faker.image.avatarGitHub(),
      password: hashedPassword,
      salt,
      organizationId: organization?.id ?? null
    });
  }

  await db.insert(schema.users).values(users).run();
  return users;
}

// ----------------------------

async function assignOrganizationMembers(
  db: ReturnType<typeof getDb>,
  users: typeof schema.users.$inferInsert[],
  organizations: typeof schema.organizations.$inferInsert[]
) {
  const members: typeof schema.organizationMembers.$inferInsert[] = [];

  for (const org of organizations) {
    const orgUsers = users.filter((u) => u.organizationId === org.id);
    const additionalUsers = faker.helpers.arrayElements(
      users.filter((u) => u.organizationId !== org.id),
      faker.number.int({ min: 0, max: 3 })
    );

    const allMembers = [...orgUsers, ...additionalUsers];
    for (const user of allMembers) {
      if (!user) continue;
      members.push({
        userId: user.id!,
        organizationId: org.id!
      });
    }
  }

  await db.insert(schema.organizationMembers).values(members).run();
}

// ----------------------------

async function createEvents(
  db: ReturnType<typeof getDb>,
  organizations: typeof schema.organizations.$inferInsert[]
) {
  const events: typeof schema.events.$inferInsert[] = [];

  for (const org of organizations) {
    const eventCount = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < eventCount; i++) {
      events.push({
        id: crypto.randomUUID(),
        title: faker.company.catchPhrase(),
        description: faker.lorem.sentence(),
        dateOfEvent: new Date(Date.now() + faker.number.int({ min: 1, max: 14 }) * 86400000),
        closeRsvpAt: new Date(Date.now() + faker.number.int({ min: 1, max: 13 }) * 86400000),
        maxAttendees: faker.number.int({ min: 10, max: 300 }),
        image: faker.image.urlPicsumPhotos(),
        organizationId: org.id!
      });
    }
  }

  await db.insert(schema.events).values(events).run();
  return events;
}

// ----------------------------

async function assignEventOrganizersAndAttendees(
  db: ReturnType<typeof getDb>,
  events: typeof schema.events.$inferInsert[],
  users: typeof schema.users.$inferInsert[]
) {
  const organizers: typeof schema.eventOrganizers.$inferInsert[] = [];
  const attendees: typeof schema.attendees.$inferInsert[] = [];

  for (const event of events) {
    const eligibleUsers = users.filter(
      (u) =>
        u.organizationId === event.organizationId ||
        faker.datatype.boolean()
    );

    const organizerCount = faker.number.int({ min: 1, max: 2 });
    const attendeeCount = faker.number.int({ min: 1, max: 10 });

    const selectedOrganizers = faker.helpers.arrayElements(
      eligibleUsers,
      organizerCount
    );
    const selectedAttendees = faker.helpers.arrayElements(
      eligibleUsers,
      attendeeCount
    );

    for (const user of selectedOrganizers) {
      organizers.push({ eventId: event.id!, userId: user.id! });
    }

    for (const user of selectedAttendees) {
      attendees.push({ eventId: event.id!, userId: user.id! });
    }
  }

  await db.insert(schema.eventOrganizers).values(organizers).run();
  await db.insert(schema.attendees).values(attendees).run();
}

// ----------------------------

async function createSessions(
  db: ReturnType<typeof getDb>,
  count: number,
  users: typeof schema.users.$inferInsert[]
) {
  const sessions: typeof schema.sessions.$inferInsert[] = [];

  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    sessions.push({
      userId: user.id!,
      sessionToken: generateSessionToken(),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    });
  }

  await db.insert(schema.sessions).values(sessions).run();
}
