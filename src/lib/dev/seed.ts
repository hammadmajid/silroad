import { generateSalt, hashPassword, generateSessionToken } from '$lib/utils/crypto';
import * as schema from '$lib/db/schema';
import { getDb, getKV } from '$lib/db';

interface SeedOptions {
	numOrgs?: number;
	numUsers?: number;
	numEventsPerOrg?: number;
	numSessions?: number;
}

const password = 'Pass!234';
const salt = generateSalt();
const hashedPassword = await hashPassword(password, salt);

function getRandomImage(category: 'avatars' | 'orgs' | 'events'): string {
	const imageNumber = Math.floor(Math.random() * 40) + 1;
	return `https://static.silroad.space/${category}/${imageNumber}.png`;
}

export async function seedDatabase(platform: App.Platform | undefined, options: SeedOptions = {}) {
	const { numOrgs = 3, numUsers = 5, numEventsPerOrg = 2, numSessions = 3 } = options;

	try {
		const db = getDb(platform);
		const kv = getKV(platform);

		await clearKV(kv);
		await clearDatabase(db);

		const organizations = await createOrganizations(db, numOrgs);
		const users = await createUsers(db, numUsers);
		await assignOrganizationMembers(db, users, organizations);
		const events = await createEvents(db, organizations, numEventsPerOrg);
		await assignEventOrganizersAndAttendees(db, events, users);
		await createSessions(db, users, numSessions);

		console.log('Database seeded successfully');
	} catch (error) {
		console.error('Failed to seed database:', error);
		throw error;
	}
}

async function clearKV(kv: KVNamespace) {
	const { keys } = await kv.list();
	for (const key of keys) {
		await kv.delete(key.name);
	}
}

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

async function createOrganizations(db: ReturnType<typeof getDb>, count: number) {
	const orgNames = ['Tech Meetup', 'Writers Club', 'Runners Group', 'Art Society', 'Book Club'];
	const organizations = Array.from({ length: count }, (_, i) => ({
		id: crypto.randomUUID(),
		name: orgNames[i] || `Organization ${i + 1}`,
		slug: (orgNames[i] || `organization-${i + 1}`).toLowerCase().replace(/\s+/g, '-'),
		description: `Community for ${orgNames[i] || `group ${i + 1}`} enthusiasts`,
		avatar: getRandomImage('avatars'),
		backgroundImage: getRandomImage('orgs')
	}));

	await db.insert(schema.organizations).values(organizations).run();
	return organizations;
}

async function createUsers(db: ReturnType<typeof getDb>, count: number) {
	const userNames = ['Test User', 'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson'];
	const emails = [
		'u@test.it',
		'alice@example.com',
		'bob@example.com',
		'carol@example.com',
		'david@example.com'
	];

	const users = Array.from({ length: count }, (_, i) => ({
		id: crypto.randomUUID(),
		name: userNames[i] || `User ${i + 1}`,
		email: emails[i] || `user${i + 1}@example.com`,
		image: getRandomImage('avatars'),
		password: hashedPassword,
		salt,
		organizationId: null
	}));

	await db.insert(schema.users).values(users).run();
	return users;
}

async function assignOrganizationMembers(
	db: ReturnType<typeof getDb>,
	users: (typeof schema.users.$inferInsert)[],
	organizations: (typeof schema.organizations.$inferInsert)[]
) {
	const members = users
		.slice(0, Math.min(users.length, organizations.length * 2))
		.map((user, i) => ({
			userId: user.id!,
			organizationId: organizations[i % organizations.length].id!
		}));

	if (members.length > 0) {
		await db.insert(schema.organizationMembers).values(members).run();
	}
}

async function createEvents(
	db: ReturnType<typeof getDb>,
	organizations: (typeof schema.organizations.$inferInsert)[],
	eventsPerOrg: number
) {
	const now = Date.now();
	const events = [];

	for (const org of organizations) {
		for (let i = 0; i < eventsPerOrg; i++) {
			const isPast = i % 2 === 1;
			const daysOffset = isPast ? -(i + 1) * 7 : (i + 1) * 7;
			const rsvpOffset = isPast ? daysOffset - 2 : daysOffset - 2;

			events.push({
				id: crypto.randomUUID(),
				title: `${org.name} Event ${i + 1}`,
				slug: `${org.slug}-event-${i + 1}`,
				description: `${isPast ? 'Past' : 'Upcoming'} event by ${org.name}`,
				dateOfEvent: new Date(now + daysOffset * 24 * 60 * 60 * 1000),
				closeRsvpAt: new Date(now + rsvpOffset * 24 * 60 * 60 * 1000),
				maxAttendees: 20 + Math.floor(Math.random() * 30),
				image: getRandomImage('events'),
				organizationId: org.id!
			});
		}
	}

	await db.insert(schema.events).values(events).run();
	return events;
}

async function assignEventOrganizersAndAttendees(
	db: ReturnType<typeof getDb>,
	events: (typeof schema.events.$inferInsert)[],
	users: (typeof schema.users.$inferInsert)[]
) {
	const organizers = events.map((event, i) => ({
		eventId: event.id!,
		userId: users[i % users.length].id!
	}));

	const attendees = events.flatMap((event) =>
		users.slice(0, Math.min(3, users.length)).map((user) => ({
			eventId: event.id!,
			userId: user.id!
		}))
	);

	if (organizers.length > 0) {
		await db.insert(schema.eventOrganizers).values(organizers).run();
	}
	if (attendees.length > 0) {
		await db.insert(schema.attendees).values(attendees).run();
	}
}

async function createSessions(
	db: ReturnType<typeof getDb>,
	users: (typeof schema.users.$inferInsert)[],
	count: number
) {
	const sessions = users.slice(0, Math.min(count, users.length)).map((user) => ({
		userId: user.id!,
		sessionToken: generateSessionToken(),
		expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
	}));

	if (sessions.length > 0) {
		await db.insert(schema.sessions).values(sessions).run();
	}
}
