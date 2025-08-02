import { sqliteTable, int } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: int()
});
