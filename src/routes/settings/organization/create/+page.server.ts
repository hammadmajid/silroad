import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';
import { OrganizationRepo } from '$lib/repos/orgs';
import { redirect } from '@sveltejs/kit';
import { isProduction } from '$lib/utils/env';
import { handleLoginRedirect } from '$lib/utils/redirect';
import { getBucket } from '$lib/db';

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
		const orgRepo = new OrganizationRepo(platform);
		const bucket = getBucket(platform);

		if (!locals.user) {
			throw redirect(303, handleLoginRedirect(event));
		}

		const formData = await request.formData();
		const form = await superValidate(formData, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const name = form.data.name.trim();
		const slug = form.data.slug.trim();
		const description = (form.data.description || '').trim();

		// Ensure slug uniqueness first
		const exists = await orgRepo.getBySlug(slug);
		if (exists) {
			return message(form, 'An organization with this slug already exists');
		}

		// Handle image uploads (validation handled by Superforms schema)
		let avatarUrl: string;
		let backgroundUrl: string;

		const avatarFile = form.data.avatar as File;
		const bgFile = form.data.backgroundImage as File;

		// Extract extension from file MIME type
		function mimeToExt(mime: string): string | undefined {
			switch (mime) {
				case 'image/png':
					return 'png';
				case 'image/jpeg':
					return 'jpg';
				case 'image/webp':
					return 'webp';
				case 'image/avif':
					return 'avif';
				default:
					return undefined;
			}
		}

		async function upload(file: File, prefix: 'avatars' | 'orgs') {
			// Get extension
			const extFromMime = mimeToExt(file.type);
			// Generate a unique key for image
			const key = `${prefix}/${slug}-${crypto.randomUUID()}.${extFromMime}`;
			// Convert file to arraybuffer to store in R2 Bucket
			const ab = await file.arrayBuffer();

			// Attempt to upload
			const obj = await bucket.put(key, ab, { httpMetadata: { contentType: file.type } });
			return `https://static.silroad.space/${obj.key}`;
		}

		try {
			avatarUrl = await upload(avatarFile, 'avatars');
		} catch (e) {
			return message(form, 'Failed to upload avatar');
		}

		try {
			backgroundUrl = await upload(bgFile, 'orgs');
		} catch (e) {
			return message(form, 'Failed to upload background image');
		}

		const org = await orgRepo.create({
			name,
			slug,
			description: description || undefined,
			avatar: avatarUrl,
			backgroundImage: backgroundUrl
		});

		if (!org) {
			return message(form, 'Failed to create organization');
		}

		await orgRepo.addMember(org.id, locals.user.id);

		throw redirect(303, `/explore/orgs/${org.slug}`);
	}
};
