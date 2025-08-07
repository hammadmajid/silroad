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
	salt: text('salt').notNull()
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
	backgroundImage: text('background_image'),
});

export const userOrganizations = sqliteTable(
	'user_organizations',
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

export const organizationMembers = sqliteTable("organization_members", {
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	organizationId: text('organization_id')
		.notNull()
		.references(() => organizations.id, { onDelete: 'cascade' })
},
	(t) => [primaryKey({ columns: [t.userId, t.organizationId] })]
)

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
