import { faker } from '@faker-js/faker';
import { generateSalt, hashPassword, generateSessionToken } from '$lib/utils/crypto';
import * as schema from '$lib/db/schema';
import { getDb, getKV, getBucket } from '$lib/db';
import sharp from 'sharp';

// prevent worker from hitting the CPU time limit
const password = 'Pass!234';
const salt = generateSalt();
const hashedPassword = await hashPassword(password, salt);

// Image generation utilities
function generateRandomColor(): string {
	return `hsl(${faker.number.int({ min: 0, max: 360 })}, ${faker.number.int({ min: 50, max: 90 })}%, ${faker.number.int({ min: 40, max: 70 })}%)`;
}

function generateAvatarSVG(initials: string): string {
	const bgColor = generateRandomColor();
	const textColor = '#ffffff';

	return `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
		<rect width="200" height="200" fill="${bgColor}"/>
		<text x="50%" y="50%" font-family="Arial, sans-serif" font-size="60" font-weight="bold" 
			  fill="${textColor}" text-anchor="middle" dominant-baseline="central">${initials}</text>
	</svg>`;
}

function generateBackgroundSVG(): string {
	const color1 = generateRandomColor();
	const color2 = generateRandomColor();
	const pattern = faker.helpers.arrayElement(['gradient', 'circles', 'waves']);

	if (pattern === 'gradient') {
		return `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style="stop-color:${color1}"/>
					<stop offset="100%" style="stop-color:${color2}"/>
				</linearGradient>
			</defs>
			<rect width="800" height="400" fill="url(#grad)"/>
		</svg>`;
	} else if (pattern === 'circles') {
		const circles = Array.from({ length: 8 }, (_, i) => {
			const cx = faker.number.int({ min: 0, max: 800 });
			const cy = faker.number.int({ min: 0, max: 400 });
			const r = faker.number.int({ min: 20, max: 80 });
			const opacity = faker.number.float({ min: 0.3, max: 0.7 });
			return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color1}" opacity="${opacity}"/>`;
		}).join('');

		return `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
			<rect width="800" height="400" fill="${color2}"/>
			${circles}
		</svg>`;
	} else {
		return `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="wave" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
					<path d="M0,25 Q25,0 50,25 T100,25" stroke="${color1}" stroke-width="3" fill="none"/>
				</pattern>
			</defs>
			<rect width="800" height="400" fill="${color2}"/>
			<rect width="800" height="400" fill="url(#wave)" opacity="0.5"/>
		</svg>`;
	}
}

async function uploadImageToR2(
	platform: App.Platform | undefined,
	svgContent: string,
	filename: string
): Promise<string> {
	try {
		const bucket = getBucket(platform);

		console.log(`Generating image for ${filename}...`);

		// Try Sharp first
		let imageData: Uint8Array;
		try {
			const pngBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();

			// Convert Buffer to Uint8Array for Cloudflare Workers compatibility
			imageData = new Uint8Array(pngBuffer);
		} catch (sharpError) {
			console.warn(`Sharp failed for ${filename}, using fallback:`, sharpError);
			// Fallback: create a simple solid color image
			const fallbackSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
				<rect width="200" height="200" fill="${generateRandomColor()}"/>
				<text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="central">IMG</text>
			</svg>`;
			const fallbackBuffer = await sharp(Buffer.from(fallbackSvg)).png().toBuffer();
			imageData = new Uint8Array(fallbackBuffer);
		}

		const uniqueKey = `seed/${filename}-${Date.now()}-${Math.random().toString(36).substring(2)}.png`;

		console.log(`Uploading ${uniqueKey} (${imageData.length} bytes)...`);

		await bucket.put(uniqueKey, imageData, {
			httpMetadata: {
				contentType: 'image/png'
			}
		});

		console.log(`Successfully uploaded ${uniqueKey}`);
		return `https://static.silroad.space/${uniqueKey}`;
	} catch (error) {
		console.error(`Error uploading image for ${filename}:`, error);
		console.error('SVG content:', svgContent);
		// Ultimate fallback: return a data URL
		return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
	}
}

async function generateAvatar(platform: App.Platform | undefined, name: string): Promise<string> {
	try {
		const initials = name
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('');
		console.log(`Generating avatar for "${name}" with initials "${initials}"`);
		const svg = generateAvatarSVG(initials);
		return await uploadImageToR2(platform, svg, 'avatar');
	} catch (error) {
		console.error(`Error generating avatar for ${name}:`, error);
		throw error;
	}
}

async function generateBackground(platform: App.Platform | undefined): Promise<string> {
	try {
		console.log('Generating background image...');
		const svg = generateBackgroundSVG();
		return await uploadImageToR2(platform, svg, 'background');
	} catch (error) {
		console.error('Error generating background:', error);
		throw error;
	}
}

// Helper function to insert data in batches
async function insertInBatches<T extends Record<string, unknown>>(
	db: ReturnType<typeof getDb>,
	table: Parameters<typeof db.insert>[0],
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

export async function seedDatabase(platform: App.Platform | undefined, count: number) {
	const db = getDb(platform);
	const kv = getKV(platform);

	try {
		console.log('Starting database seeding...');

		await clearKV(kv);
		console.log('KV cleared');

		await clearDatabase(db);
		console.log('Database cleared');

		const organizations = await createOrganizations(db, platform, count);
		console.log(`Created ${organizations.length} organizations`);

		const users = await createUsers(db, platform, count, organizations);
		console.log(`Created ${users.length} users`);

		await assignOrganizationMembers(db, users, organizations);
		console.log('Assigned organization members');

		const events = await createEvents(db, platform, organizations);
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

		const avatar = await generateAvatar(platform, name);
		const backgroundImage = await generateBackground(platform);

		organizations.push({
			id: crypto.randomUUID(),
			name,
			slug,
			description: faker.company.catchPhrase(),
			avatar,
			backgroundImage
		});
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
	const testUserAvatar = await generateAvatar(platform, 'Test User');
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
		const userAvatar = await generateAvatar(platform, fullName);

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
	const members: (typeof schema.organizationMembers.$inferInsert)[] = [];
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
		for (let i = 0; i < eventCount; i++) {
			const now = Date.now();
			const daysUntilEvent = faker.number.int({ min: 2, max: 14 }); // Start from 2 days
			const daysUntilRsvpClose = faker.number.int({ min: 1, max: daysUntilEvent - 1 });
			const title = faker.company.catchPhrase();
			const eventImage = await generateBackground(platform);

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
	const organizers: (typeof schema.eventOrganizers.$inferInsert)[] = [];
	const attendees: (typeof schema.attendees.$inferInsert)[] = [];
	const organizerPairs = new Set<string>();
	const attendeePairs = new Set<string>();

	for (const event of events) {
		const eligibleUsers = users.filter(
			(u) => u.organizationId === event.organizationId || faker.datatype.boolean()
		);

		if (eligibleUsers.length === 0) continue;

		const organizerCount = Math.min(faker.number.int({ min: 1, max: 2 }), eligibleUsers.length);
		const attendeeCount = Math.min(faker.number.int({ min: 1, max: 10 }), eligibleUsers.length);

		const selectedOrganizers = faker.helpers.arrayElements(eligibleUsers, organizerCount);
		const selectedAttendees = faker.helpers.arrayElements(eligibleUsers, attendeeCount);

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
	users: (typeof schema.users.$inferInsert)[]
) {
	const sessions: (typeof schema.sessions.$inferInsert)[] = [];

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
