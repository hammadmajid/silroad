import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()).notNull(),
	name: text("name").notNull(),
	email: text("email").unique().notNull(),
	emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
	image: text("image"),
	password: text("password").notNull(),
	hash: text("hash").notNull(),
})

export const verificationTokens = sqliteTable(
	"verificationTokens",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
	},
	(verificationToken) => [primaryKey({
		columns: [verificationToken.identifier, verificationToken.token],
	}),
	]
)

export const sessions = sqliteTable("sessions", {
	sessionToken: text("sessionToken").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
})