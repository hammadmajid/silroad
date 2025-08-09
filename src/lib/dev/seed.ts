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

// Helper function to insert data in batches
async function insertInBatches<T extends Record<string, any>>(
  db: ReturnType<typeof getDb>,
  table: any,
  data: T[],
  batchSize: number = 10
) {
  if (data.length === 0) return;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    try {
      await db.insert(table).values(batch).run();
    } catch (error) {
      console.error(`Failed to insert batch ${Math.floor(i / batchSize) + 1}:`, error);
      throw error;
    }
  }
}

export async function seedDatabase(
  platform: App.Platform | undefined,
  count: number
) {
  const db = getDb(platform);

  try {
    console.log('Starting database seeding...');

    await clearDatabase(db);
    console.log('Database cleared');

    const organizations = await createOrganizations(db, count);
    console.log(`Created ${organizations.length} organizations`);

    const users = await createUsers(db, count, organizations);
    console.log(`Created ${users.length} users`);

    await assignOrganizationMembers(db, users, organizations);
    console.log('Assigned organization members');

    const events = await createEvents(db, organizations);
    console.log(`Created ${events.length} events`);

    await assignEventOrganizersAndAttendees(db, events, users);
    console.log('Assigned event organizers and attendees');

    await createSessions(db, count, users);
    console.log(`Created ${count} sessions`);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
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
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i++) {
    const name = faker.company.name();
    let slug = faker.helpers.slugify(name.toLowerCase());

    // Ensure unique slugs
    let counter = 1;
    while (usedSlugs.has(slug)) {
      slug = `${faker.helpers.slugify(name.toLowerCase())}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);

    organizations.push({
      id: crypto.randomUUID(),
      name,
      slug,
      description: faker.company.catchPhrase(),
      avatar: faker.image.avatar(),
      backgroundImage: faker.image.urlPicsumPhotos()
    });
  }

  // Insert in batches to avoid SQL limits
  await insertInBatches(db, schema.organizations, organizations, 10);
  return organizations;
}

// ----------------------------

async function createUsers(
  db: ReturnType<typeof getDb>,
  count: number,
  organizations: typeof schema.organizations.$inferInsert[]
) {
  const users: typeof schema.users.$inferInsert[] = [];
  const usedEmails = new Set<string>();
  const usedOrganizationIds = new Set<string>();

  // Always create the testing user with email u@test.it
  users.push({
    id: crypto.randomUUID(),
    name: 'Test User',
    email: 'u@test.it',
    image: faker.image.avatarGitHub(),
    password: hashedPassword,
    salt,
    organizationId: null
  });
  usedEmails.add('u@test.it');

  for (let i = 0; i < count; i++) {
    // Only assign organization if it hasn't been used (due to unique constraint)
    let organization: typeof schema.organizations.$inferInsert | undefined;
    if (organizations.length > 0) {
      const availableOrgs = organizations.filter(org => !usedOrganizationIds.has(org.id!));
      if (availableOrgs.length > 0 && faker.datatype.boolean()) {
        organization = faker.helpers.arrayElement(availableOrgs);
        if (organization?.id) {
          usedOrganizationIds.add(organization.id);
        }
      }
    }

    // Ensure unique emails
    let email = faker.internet.email();
    let counter = 1;
    while (usedEmails.has(email)) {
      const [localPart, domain] = email.split('@');
      email = `${localPart}${counter}@${domain}`;
      counter++;
    }
    usedEmails.add(email);

    users.push({
      id: crypto.randomUUID(),
      name: faker.person.fullName(),
      email,
      // Omit emailVerified to let it default to null/undefined
      image: faker.image.avatarGitHub(),
      password: hashedPassword,
      salt,
      organizationId: organization?.id || null
    });
  }

  // Insert in batches to avoid SQL limits
  await insertInBatches(db, schema.users, users, 10);
  return users;
}

// ----------------------------

async function assignOrganizationMembers(
  db: ReturnType<typeof getDb>,
  users: typeof schema.users.$inferInsert[],
  organizations: typeof schema.organizations.$inferInsert[]
) {
  const members: typeof schema.organizationMembers.$inferInsert[] = [];
  const memberPairs = new Set<string>();

  for (const org of organizations) {
    const orgUsers = users.filter((u) => u.organizationId === org.id);
    const additionalUsers = faker.helpers.arrayElements(
      users.filter((u) => u.organizationId !== org.id),
      faker.number.int({ min: 0, max: 3 })
    );

    const allMembers = [...orgUsers, ...additionalUsers];
    for (const user of allMembers) {
      if (!user) continue;

      const pairKey = `${user.id}-${org.id}`;
      if (!memberPairs.has(pairKey)) {
        memberPairs.add(pairKey);
        members.push({
          userId: user.id!,
          organizationId: org.id!
        });
      }
    }
  }

  // Insert in batches to avoid SQL limits
  await insertInBatches(db, schema.organizationMembers, members, 10);
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
      const now = Date.now();
      const daysUntilEvent = faker.number.int({ min: 2, max: 14 }); // Start from 2 days
      const daysUntilRsvpClose = faker.number.int({ min: 1, max: daysUntilEvent - 1 });

      events.push({
        id: crypto.randomUUID(),
        title: faker.company.catchPhrase(),
        description: faker.lorem.sentence(),
        dateOfEvent: new Date(now + daysUntilEvent * 86400000),
        closeRsvpAt: new Date(now + daysUntilRsvpClose * 86400000),
        maxAttendees: faker.number.int({ min: 10, max: 300 }),
        image: faker.image.urlPicsumPhotos(),
        organizationId: org.id!
      });
    }
  }

  // Insert in batches to avoid SQL limits
  await insertInBatches(db, schema.events, events, 10);
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
  const organizerPairs = new Set<string>();
  const attendeePairs = new Set<string>();

  for (const event of events) {
    const eligibleUsers = users.filter(
      (u) =>
        u.organizationId === event.organizationId ||
        faker.datatype.boolean()
    );

    if (eligibleUsers.length === 0) continue;

    const organizerCount = Math.min(
      faker.number.int({ min: 1, max: 2 }),
      eligibleUsers.length
    );
    const attendeeCount = Math.min(
      faker.number.int({ min: 1, max: 10 }),
      eligibleUsers.length
    );

    const selectedOrganizers = faker.helpers.arrayElements(
      eligibleUsers,
      organizerCount
    );
    const selectedAttendees = faker.helpers.arrayElements(
      eligibleUsers,
      attendeeCount
    );

    for (const user of selectedOrganizers) {
      const pairKey = `${event.id}-${user.id}`;
      if (!organizerPairs.has(pairKey)) {
        organizerPairs.add(pairKey);
        organizers.push({ eventId: event.id!, userId: user.id! });
      }
    }

    for (const user of selectedAttendees) {
      const pairKey = `${event.id}-${user.id}`;
      if (!attendeePairs.has(pairKey)) {
        attendeePairs.add(pairKey);
        attendees.push({ eventId: event.id!, userId: user.id! });
      }
    }
  }

  // Insert in batches to avoid SQL limits
  await insertInBatches(db, schema.eventOrganizers, organizers, 10);
  await insertInBatches(db, schema.attendees, attendees, 10);
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

  // Insert in batches to avoid SQL limits
  await insertInBatches(db, schema.sessions, sessions, 10);
}
