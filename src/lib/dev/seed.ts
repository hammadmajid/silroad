import { faker } from '@faker-js/faker';
import { generateSalt, hashPassword, generateSessionToken } from '$lib/utils/crypto';
import * as schema from '$lib/db/schema';
import { getDb, getKV, getBucket } from '$lib/db';

// prevent worker from hitting the CPU time limit
const password = 'Pass!234';
const salt = generateSalt();
const hashedPassword = await hashPassword(password, salt);

// Image utilities
async function listImagesFromPath(
	platform: App.Platform | undefined,
	path: string
): Promise<string[]> {
	try {
		const bucket = getBucket(platform);
		console.log(`📁 Listing images from path: ${path}`);

		const { objects } = await bucket.list({ prefix: path });
		const imageUrls = objects
			.filter((obj) => obj.key.match(/\.(jpg|jpeg|png|gif|webp)$/i))
			.map((obj) => `https://static.silroad.space/${obj.key}`);

		console.log(`📸 Found ${imageUrls.length} images in ${path}:`, imageUrls);
		return imageUrls;
	} catch (error) {
		console.error(`❌ Error listing images from ${path}:`, error);
		return [];
	}
}

async function getRandomImageFromPath(
	platform: App.Platform | undefined,
	path: string,
	fallbackUrl?: string
): Promise<string> {
	try {
		console.log(`🎲 Getting random image from path: ${path}`);
		const images = await listImagesFromPath(platform, path);

		if (images.length === 0) {
			console.warn(`⚠️ No images found in ${path}, using fallback`);
			return fallbackUrl || `https://static.silroad.space/default.png`;
		}

		const selectedImage = faker.helpers.arrayElement(images);
		console.log(`✅ Selected random image: ${selectedImage}`);
		return selectedImage;
	} catch (error) {
		console.error(`❌ Error getting random image from ${path}:`, error);
		return fallbackUrl || `https://static.silroad.space/default.png`;
	}
}

async function getRandomAvatar(platform: App.Platform | undefined, name: string): Promise<string> {
	console.log(`👤 Getting random avatar for: ${name}`);
	return await getRandomImageFromPath(
		platform,
		'avatar/',
		`https://static.silroad.space/avatar/default.png`
	);
}

async function getRandomOrgBackground(platform: App.Platform | undefined): Promise<string> {
	console.log(`🏢 Getting random organization background`);
	return await getRandomImageFromPath(
		platform,
		'orgs/',
		`https://static.silroad.space/orgs/default.png`
	);
}

async function getRandomEventBackground(platform: App.Platform | undefined): Promise<string> {
	console.log(`🎉 Getting random event background`);
	return await getRandomImageFromPath(
		platform,
		'events/',
		`https://static.silroad.space/events/default.png`
	);
}

// Helper function to insert data in batches
async function insertInBatches<T extends Record<string, unknown>>(
	db: ReturnType<typeof getDb>,
	table: Parameters<typeof db.insert>[0],
	data: T[],
	batchSize: number = 10
) {
	if (data.length === 0) {
		console.log('📝 No data to insert, skipping batch insertion');
		return;
	}

	console.log(`📦 Inserting ${data.length} records in batches of ${batchSize}`);
	for (let i = 0; i < data.length; i += batchSize) {
		const batch = data.slice(i, i + batchSize);
		const batchNumber = Math.floor(i / batchSize) + 1;
		const totalBatches = Math.ceil(data.length / batchSize);

		try {
			console.log(`📝 Inserting batch ${batchNumber}/${totalBatches} (${batch.length} records)`);
			await db.insert(table).values(batch).run();
			console.log(`✅ Batch ${batchNumber}/${totalBatches} inserted successfully`);
		} catch (error) {
			console.error(`❌ Failed to insert batch ${batchNumber}/${totalBatches}:`, error);
			throw error;
		}
	}
	console.log(`🎯 All ${data.length} records inserted successfully`);
}

export async function seedDatabase(platform: App.Platform | undefined, count: number) {
	const db = getDb(platform);
	const kv = getKV(platform);

	try {
		console.log('🚀 Starting database seeding...');
		console.log(`📊 Configuration: ${count} items requested`);

		console.log('🧹 Clearing KV store...');
		await clearKV(kv);
		console.log('✅ KV cleared');

		console.log('🧹 Clearing database...');
		await clearDatabase(db);
		console.log('✅ Database cleared');

		console.log('🏢 Creating organizations...');
		const organizations = await createOrganizations(db, platform, count);
		console.log(`✅ Created ${organizations.length} organizations`);

		console.log('👥 Creating users...');
		const users = await createUsers(db, platform, count, organizations);
		console.log(`✅ Created ${users.length} users`);

		console.log('🤝 Assigning organization members...');
		await assignOrganizationMembers(db, users, organizations);
		console.log('✅ Assigned organization members');

		console.log('🎉 Creating events...');
		const events = await createEvents(db, platform, organizations);
		console.log(`✅ Created ${events.length} events`);

		console.log('👤 Assigning event organizers and attendees...');
		await assignEventOrganizersAndAttendees(db, events, users);
		console.log('✅ Assigned event organizers and attendees');

		console.log('🔐 Creating sessions...');
		await createSessions(db, count, users);
		console.log(`✅ Created ${count} sessions`);

		console.log('🎊 Database seeding completed successfully!');
		console.log(
			`📈 Final stats: ${organizations.length} orgs, ${users.length} users, ${events.length} events`
		);
	} catch (error) {
		console.error('💥 Error during database seeding:', error);
		throw error;
	}
}

// ----------------------------

async function clearKV(kv: KVNamespace) {
	console.log('🗑️ Listing KV keys for deletion...');
	const { keys } = await kv.list();
	console.log(`🔑 Found ${keys.length} keys to delete`);

	for (const key of keys) {
		console.log(`🗑️ Deleting KV key: ${key.name}`);
		await kv.delete(key.name);
	}
	console.log(`✅ Deleted ${keys.length} KV keys`);
}

async function clearDatabase(db: ReturnType<typeof getDb>) {
	console.log('🗑️ Clearing all database tables...');
	const tables = [
		'attendees',
		'eventOrganizers',
		'events',
		'organizationMembers',
		'sessions',
		'verificationTokens',
		'users',
		'organizations'
	];

	for (const tableName of tables) {
		console.log(`🗑️ Clearing table: ${tableName}`);
		switch (tableName) {
			case 'attendees':
				await db.delete(schema.attendees).run();
				break;
			case 'eventOrganizers':
				await db.delete(schema.eventOrganizers).run();
				break;
			case 'events':
				await db.delete(schema.events).run();
				break;
			case 'organizationMembers':
				await db.delete(schema.organizationMembers).run();
				break;
			case 'sessions':
				await db.delete(schema.sessions).run();
				break;
			case 'verificationTokens':
				await db.delete(schema.verificationTokens).run();
				break;
			case 'users':
				await db.delete(schema.users).run();
				break;
			case 'organizations':
				await db.delete(schema.organizations).run();
				break;
		}
		console.log(`✅ Cleared table: ${tableName}`);
	}
}

// ----------------------------

async function createOrganizations(
	db: ReturnType<typeof getDb>,
	platform: App.Platform | undefined,
	count: number
) {
	const organizations: (typeof schema.organizations.$inferInsert)[] = [];
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

		console.log(`🏢 Creating organization ${i + 1}/${count}: ${name}`);
		const avatar = await getRandomAvatar(platform, name);
		const backgroundImage = await getRandomOrgBackground(platform);

		organizations.push({
			id: crypto.randomUUID(),
			name,
			slug,
			description: faker.company.catchPhrase(),
			avatar,
			backgroundImage
		});
		console.log(`✅ Organization created: ${name} (${slug})`);
	}

	// Insert in batches to avoid SQL limits
	await insertInBatches(db, schema.organizations, organizations, 10);
	return organizations;
}

// ----------------------------

async function createUsers(
	db: ReturnType<typeof getDb>,
	platform: App.Platform | undefined,
	count: number,
	organizations: (typeof schema.organizations.$inferInsert)[]
) {
	const users: (typeof schema.users.$inferInsert)[] = [];
	const usedEmails = new Set<string>();
	const usedOrganizationIds = new Set<string>();

	// Always create the testing user with email u@test.it
	console.log(`👤 Creating test user: Test User (u@test.it)`);
	const testUserAvatar = await getRandomAvatar(platform, 'Test User');
	users.push({
		id: crypto.randomUUID(),
		name: 'Test User',
		email: 'u@test.it',
		image: testUserAvatar,
		password: hashedPassword,
		salt,
		organizationId: null
	});
	usedEmails.add('u@test.it');
	console.log(`✅ Test user created with avatar: ${testUserAvatar}`);

	for (let i = 0; i < count; i++) {
		// Only assign organization if it hasn't been used (due to unique constraint)
		let organization: typeof schema.organizations.$inferInsert | undefined;
		if (organizations.length > 0) {
			const availableOrgs = organizations.filter((org) => !usedOrganizationIds.has(org.id!));
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

		const fullName = faker.person.fullName();
		console.log(`👤 Creating user ${i + 1}/${count}: ${fullName} (${email})`);
		const userAvatar = await getRandomAvatar(platform, fullName);

		users.push({
			id: crypto.randomUUID(),
			name: fullName,
			email,
			// Omit emailVerified to let it default to null/undefined
			image: userAvatar,
			password: hashedPassword,
			salt,
			organizationId: organization?.id || null
		});
		console.log(`✅ User created: ${fullName} with avatar: ${userAvatar}`);
	}

	// Insert in batches to avoid SQL limits
	await insertInBatches(db, schema.users, users, 10);
	return users;
}

// ----------------------------

async function assignOrganizationMembers(
	db: ReturnType<typeof getDb>,
	users: (typeof schema.users.$inferInsert)[],
	organizations: (typeof schema.organizations.$inferInsert)[]
) {
	console.log('🤝 Starting organization member assignment...');
	const members: (typeof schema.organizationMembers.$inferInsert)[] = [];
	const memberPairs = new Set<string>();

	for (const org of organizations) {
		console.log(`🤝 Processing members for organization: ${org.name}`);
		const orgUsers = users.filter((u) => u.organizationId === org.id);
		const additionalUsers = faker.helpers.arrayElements(
			users.filter((u) => u.organizationId !== org.id),
			faker.number.int({ min: 0, max: 3 })
		);

		const allMembers = [...orgUsers, ...additionalUsers];
		console.log(`👥 Assigning ${allMembers.length} members to ${org.name}`);

		for (const user of allMembers) {
			if (!user) continue;

			const pairKey = `${user.id}-${org.id}`;
			if (!memberPairs.has(pairKey)) {
				memberPairs.add(pairKey);
				members.push({
					userId: user.id!,
					organizationId: org.id!
				});
				console.log(`✅ Added ${user.name} to ${org.name}`);
			}
		}
	}

	console.log(`📊 Total organization memberships to create: ${members.length}`);
	// Insert in batches to avoid SQL limits
	await insertInBatches(db, schema.organizationMembers, members, 10);
}

// ----------------------------

// Helper function to create slug from title
function createSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') // Remove special chars
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single
		.trim();
}

// Helper function to create unique slug
function createUniqueSlug(title: string, usedSlugs: Set<string>): string {
	const baseSlug = createSlug(title);
	let slug = baseSlug;
	let counter = 1;

	while (usedSlugs.has(slug)) {
		slug = `${baseSlug}-${counter}`;
		counter++;
	}

	usedSlugs.add(slug);
	return slug;
}

async function createEvents(
	db: ReturnType<typeof getDb>,
	platform: App.Platform | undefined,
	organizations: (typeof schema.organizations.$inferInsert)[]
) {
	const events: (typeof schema.events.$inferInsert)[] = [];
	const usedSlugs = new Set<string>();

	for (const org of organizations) {
		const eventCount = faker.number.int({ min: 0, max: 3 });
		console.log(`🎉 Creating ${eventCount} events for organization: ${org.name}`);

		for (let i = 0; i < eventCount; i++) {
			const now = Date.now();
			const daysUntilEvent = faker.number.int({ min: 2, max: 14 }); // Start from 2 days
			const daysUntilRsvpClose = faker.number.int({ min: 1, max: daysUntilEvent - 1 });
			const title = faker.company.catchPhrase();

			console.log(`🎉 Creating event ${i + 1}/${eventCount}: ${title}`);
			const eventImage = await getRandomEventBackground(platform);

			events.push({
				id: crypto.randomUUID(),
				title,
				slug: createUniqueSlug(title, usedSlugs),
				description: faker.lorem.sentence(),
				dateOfEvent: new Date(now + daysUntilEvent * 86400000),
				closeRsvpAt: new Date(now + daysUntilRsvpClose * 86400000),
				maxAttendees: faker.number.int({ min: 10, max: 300 }),
				image: eventImage,
				organizationId: org.id!
			});
			console.log(`✅ Event created: ${title} with image: ${eventImage}`);
		}
	}

	// Insert in batches to avoid SQL limits
	await insertInBatches(db, schema.events, events, 10);
	return events;
}

// ----------------------------

async function assignEventOrganizersAndAttendees(
	db: ReturnType<typeof getDb>,
	events: (typeof schema.events.$inferInsert)[],
	users: (typeof schema.users.$inferInsert)[]
) {
	console.log('👤 Starting event organizer and attendee assignment...');
	const organizers: (typeof schema.eventOrganizers.$inferInsert)[] = [];
	const attendees: (typeof schema.attendees.$inferInsert)[] = [];
	const organizerPairs = new Set<string>();
	const attendeePairs = new Set<string>();

	for (const event of events) {
		console.log(`🎯 Processing assignments for event: ${event.title}`);
		const eligibleUsers = users.filter(
			(u) => u.organizationId === event.organizationId || faker.datatype.boolean()
		);

		if (eligibleUsers.length === 0) {
			console.warn(`⚠️ No eligible users found for event: ${event.title}`);
			continue;
		}

		const organizerCount = Math.min(faker.number.int({ min: 1, max: 2 }), eligibleUsers.length);
		const attendeeCount = Math.min(faker.number.int({ min: 1, max: 10 }), eligibleUsers.length);

		console.log(
			`👥 Assigning ${organizerCount} organizers and ${attendeeCount} attendees to ${event.title}`
		);

		const selectedOrganizers = faker.helpers.arrayElements(eligibleUsers, organizerCount);
		const selectedAttendees = faker.helpers.arrayElements(eligibleUsers, attendeeCount);

		for (const user of selectedOrganizers) {
			const pairKey = `${event.id}-${user.id}`;
			if (!organizerPairs.has(pairKey)) {
				organizerPairs.add(pairKey);
				organizers.push({ eventId: event.id!, userId: user.id! });
				console.log(`👨‍💼 Added organizer: ${user.name} for ${event.title}`);
			}
		}

		for (const user of selectedAttendees) {
			const pairKey = `${event.id}-${user.id}`;
			if (!attendeePairs.has(pairKey)) {
				attendeePairs.add(pairKey);
				attendees.push({ eventId: event.id!, userId: user.id! });
				console.log(`🎫 Added attendee: ${user.name} for ${event.title}`);
			}
		}
	}

	console.log(`📊 Total organizers to create: ${organizers.length}`);
	console.log(`📊 Total attendees to create: ${attendees.length}`);

	// Insert in batches to avoid SQL limits
	await insertInBatches(db, schema.eventOrganizers, organizers, 10);
	await insertInBatches(db, schema.attendees, attendees, 10);
}

// ----------------------------

async function createSessions(
	db: ReturnType<typeof getDb>,
	count: number,
	users: (typeof schema.users.$inferInsert)[]
) {
	console.log(`🔐 Creating ${count} user sessions...`);
	const sessions: (typeof schema.sessions.$inferInsert)[] = [];

	for (let i = 0; i < count; i++) {
		const user = users[i % users.length];
		const sessionToken = generateSessionToken();
		const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

		sessions.push({
			userId: user.id!,
			sessionToken,
			expires
		});
		console.log(
			`🔑 Created session ${i + 1}/${count} for user: ${user.name} (expires: ${expires.toISOString()})`
		);
	}

	console.log(`📊 Total sessions to create: ${sessions.length}`);
	// Insert in batches to avoid SQL limits
	await insertInBatches(db, schema.sessions, sessions, 10);
}
