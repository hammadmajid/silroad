import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name"),
	email: text("email").unique(),
	emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
	image: text("image"),
	password: text("password").notNull(),
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