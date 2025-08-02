import { mysqlTable, int } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: int()
});
