import type { Actions, PageServerLoad } from './$types';
import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';
import { redirect } from '@sveltejs/kit';
import { isProduction } from '$lib/utils/env';
import { handleLoginRedirect } from '$lib/utils/redirect';
import { getBucket, getDb } from '$lib/db';
import { events, eventOrganizers, users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const { locals, platform } = event;

	if (!locals.user) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Check if user has an organization
	const db = getDb(platform);
	const userResult = await db
		.select({ organizationId: users.organizationId })
		.from(users)
		.where(eq(users.id, locals.user.id))
		.limit(1);

	const user = userResult[0];
	if (!user?.organizationId) {
		throw redirect(303, '/manage/org/create?msg=You need to create an organization first');
	}

	return {
		isProd: isProduction(platform),
		form: await superValidate(zod4(schema)),
		organizationId: user.organizationId
	};
};

export const actions: Actions = {
	default: async (event) => {
		const { request, locals, platform } = event;
		const db = getDb(platform);
		const bucket = getBucket(platform);

		if (!locals.user) {
			throw redirect(303, handleLoginRedirect(event));
		}

		// Verify user has an organization
		const userResult = await db
			.select({ organizationId: users.organizationId })
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);

		const user = userResult[0];
		if (!user?.organizationId) {
			throw redirect(303, '/manage/org/create?msg=You need to create an organization first');
		}

		const formData = await request.formData();
		const form = await superValidate(formData, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const title = form.data.title.trim();
		const slug = form.data.slug.trim();
		const description = (form.data.description || '').trim();
		const dateOfEvent = new Date(form.data.dateOfEvent);
		const closeRsvpAt = form.data.closeRsvpAt ? new Date(form.data.closeRsvpAt) : null;
		const maxAttendees = form.data.maxAttendees || null;

		// Validate dates
		const now = new Date();
		if (dateOfEvent <= now) {
			return message(form, 'Event date must be in the future');
		}

		if (closeRsvpAt && closeRsvpAt >= dateOfEvent) {
			return message(form, 'RSVP close date must be before the event date');
		}

		// Ensure slug uniqueness
		const existsResult = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
		const exists = existsResult[0];
		if (exists) {
			return message(form, 'An event with this slug already exists');
		}

		// Handle image upload
		let imageUrl!: string | null;
		imageUrl = null; // Default to no image
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
				const key = `events/${slug}-${crypto.randomUUID()}.${extFromMime}`;
				const ab = await imageFile.arrayBuffer();

				const obj = await bucket.put(key, ab, { httpMetadata: { contentType: imageFile.type } });
				imageUrl = `https://static.silroad.space/${obj.key}`;
			} catch {
				return message(form, 'Failed to upload event image');
			}
		}

		const [newEvent] = await db
			.insert(events)
			.values({
				title,
				slug,
				description: description || null,
				dateOfEvent,
				closeRsvpAt,
				maxAttendees,
				image: imageUrl,
				organizationId: user.organizationId
			})
			.returning();

		if (!newEvent) {
			return message(form, 'Failed to create event');
		}

		// Add the creating user as an organizer of the event
		await db.insert(eventOrganizers).values({
			eventId: newEvent.id,
			userId: locals.user.id
		});

		throw redirect(303, `/explore/events/${newEvent.slug}`);
	}
};
