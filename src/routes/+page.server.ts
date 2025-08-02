import { users } from "../db/schema";
import { getDb } from "$lib/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform }) => {
    const db = getDb(platform);
    const userList = await db.select().from(users);
    return { users: userList };
};
