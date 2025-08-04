import type { PageServerLoad } from "./$types";
import { schema } from "./schema";
import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail, redirect } from '@sveltejs/kit';
import { getDb } from "$lib/db"
import { users } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { generateSalt, hashPassword } from "$lib/utils/crypto";

export const load: PageServerLoad = async () => {
    return {
        form: await superValidate(zod4(schema)),
    };
};

export const actions = {
    default: async ({ request, platform }) => {
        const form = await superValidate(request, zod4(schema));
        const db = getDb(platform);

        if (!form.valid) {
            return fail(400, { form });
        }

        const { firstName, lastName, email, password } = form.data;

        // hash password here to prevent timing attack
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);

        const exists = await db.select().from(users).where(eq(users.email, email));

        if (exists.length > 0) {
            return message(form, 'Failed to create user');
        }

        const [user] = await db.insert(users).values({
            name: `${firstName} ${lastName}`,
            email: email,
            password: hashedPassword,
            hash: salt,
        }).returning()

        // TODO: create session in db
        // TODO: cache session in KV

        throw redirect(301, "/settings/profile");
    }
}