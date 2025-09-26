import { handleLoginRedirect } from '$lib/utils/redirect';
import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { schema } from './schema';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { getDb, getBucket } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { locals, platform } = event;
	// Server-side check for SEO and initial render
	// Client-side protection handled by useProtectedRoute hook
	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	const db = getDb(platform);
	const userResult = await db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			image: users.image,
			createdAt: users.createdAt
		})
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);
	const user = userResult[0];

	if (!user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Initialize form with current user data
	const form = await superValidate(
		{
			name: user.name
		},
		zod4(schema)
	);

	return {
		form,
		createdAt: user.createdAt
	};
};

export const actions: Actions = {
	default: async ({ request, platform, locals }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod4(schema));

		if (!locals.user) {
			return fail(401, { form });
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const db = getDb(platform);
		const bucket = getBucket(platform);
		const { name } = form.data;

		// Get current user data
		const currentUserResult = await db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				image: users.image
			})
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);
		const currentUser = currentUserResult[0];
		if (!currentUser) {
			return message(form, 'User not found');
		}

		// Handle image upload
		let imageUrl: string | null = currentUser.image;
		const imageFile = form.data.image;

		if (imageFile && imageFile.size > 0) {
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

			try {
				const extFromMime = mimeToExt(imageFile.type);
				const key = `users/${locals.user.id}-${crypto.randomUUID()}.${extFromMime}`;
				const ab = await imageFile.arrayBuffer();

				const obj = await bucket.put(key, ab, { httpMetadata: { contentType: imageFile.type } });
				imageUrl = `https://static.silroad.space/${obj.key}`;
			} catch {
				return message(form, 'Failed to upload profile image');
			}
		}

		// Update user
		const [updatedUser] = await db
			.update(users)
			.set({
				name,
				image: imageUrl
			})
			.where(eq(users.id, locals.user.id))
			.returning({
				id: users.id,
				email: users.email,
				name: users.name,
				image: users.image
			});

		if (!updatedUser) {
			return message(form, 'Failed to update profile');
		}

		return message(form, 'Profile updated successfully');
	}
};
