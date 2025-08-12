import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID())
		.notNull(),
	name: text('name').notNull(),
	email: text('email').unique().notNull(),
	emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
	image: text('image'),
	password: text('password').notNull(),
	salt: text('salt').notNull(),
	organizationId: text('organization_id')
		.unique()
		.references(() => organizations.id, { onDelete: 'set null' })
});

export const organizations = sqliteTable('organizations', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID())
		.notNull(),
	name: text('name').notNull(),
	slug: text('slug').unique().notNull(),
	description: text('description'),
	avatar: text('avatar'),
	backgroundImage: text('background_image')
});

export const organizationMembers = sqliteTable(
	'organization_members',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organizations.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.userId, t.organizationId] })]
);

export const events = sqliteTable('events', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID())
		.notNull(),
	title: text('title').notNull(),
	slug: text('slug').unique().notNull(),
	description: text('description'),
	dateOfEvent: integer('date_of_event', { mode: 'timestamp_ms' }).notNull(),
	closeRsvpAt: integer('close_rsvp_at', { mode: 'timestamp_ms' }),
	maxAttendees: integer('max_attendees'),
	image: text('image'),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organizations.id, { onDelete: 'cascade' })
});

export const eventOrganizers = sqliteTable(
	'event_organizers',
	{
		eventId: text('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);

export const attendees = sqliteTable(
	'attendees',
	{
		eventId: text('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' })
	},
	(t) => [primaryKey({ columns: [t.eventId, t.userId] })]
);

export const verificationTokens = sqliteTable(
	'verificationTokens',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
	},
	(verificationToken) => [
		primaryKey({
			columns: [verificationToken.identifier, verificationToken.token]
		})
	]
);

export const sessions = sqliteTable('sessions', {
	sessionToken: text('sessionToken').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
});
