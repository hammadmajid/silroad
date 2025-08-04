import type { PageServerLoad } from "./$types";
import { schema } from "./schema";
import { superValidate, message } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    return {
        // @ts-expect-error: https://github.com/ciscoheat/sveltekit-superforms/issues/626
        form: await superValidate(zod4(schema)),
    };
};

export const actions = {
    default: async ({ request }) => {
        // @ts-expect-error: https://github.com/ciscoheat/sveltekit-superforms/issues/626
        const form = await superValidate(request, zod4(schema));

        if (!form.valid) {
            return fail(400, { form });
        }

        // TODO: store user in db
        await new Promise((resolve) => setTimeout(resolve, 2000));

        return message(form, 'User created successfully!');
    }
}