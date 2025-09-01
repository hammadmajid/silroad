import { z } from 'zod/v4';

const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'] as const;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const fileSchema = z
	.instanceof(File, { message: 'Please upload a file.' })
	.refine((f) => f.size < MAX_IMAGE_BYTES, 'Max 5 MB upload size.')
	.refine((f) => IMAGE_MIME_TYPES.includes(f.type as typeof IMAGE_MIME_TYPES[number]), 'Invalid image type.');

export const schema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	slug: z
		.string()
		.min(2, 'Slug must be at least 2 characters')
		.regex(
			/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
			'Slug can contain lowercase letters, numbers and hyphens, cannot start or end with hyphen.'
		),
	description: z.string().max(500, 'Description too long').optional().or(z.literal('')),
	avatar: fileSchema,
	backgroundImage: fileSchema
});
