import type { Actions, PageServerLoad } from './$types';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';
import { OrganizationRepo } from '$lib/repos/orgs';
import { fail, redirect } from '@sveltejs/kit';
import { isProduction } from '$lib/utils/env';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: PageServerLoad = async (event) => {
	const { locals, platform } = event;

	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	return {
		isProd: isProduction(platform),
		form: await superValidate(zod4(schema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, locals, platform } = event;
		const form = await superValidate(request, zod4(schema));
		const orgRepo = new OrganizationRepo(platform);

		if (!locals.user) {
			throw redirect(303, handleLoginRedirect(event));
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const name = form.data.name.trim();
		const slug = form.data.slug.trim();
		const description = (form.data.description || '').trim();
		const avatar = (form.data.avatar || '').trim();
		const backgroundImage = (form.data.backgroundImage || '').trim();

		// Ensure slug uniqueness
		const exists = await orgRepo.getBySlug(slug);
		if (exists) {
			return message(form, 'An organization with this slug already exists');
		}

		const org = await orgRepo.create({
			name,
			slug,
			description: description || undefined,
			avatar: avatar || undefined,
			backgroundImage: backgroundImage || undefined
		});

		if (!org) {
			return message(form, 'Failed to create organization');
		}

		// Add creator as a member (best UX)
		await orgRepo.addMember(org.id, locals.user.id);

		throw redirect(303, `/explore/orgs/${org.slug}`);
	}
};
