import { z } from 'zod/v4';

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
	avatar: z.string().url('Enter a valid URL').optional().or(z.literal('')),
	backgroundImage: z.string().url('Enter a valid URL').optional().or(z.literal(''))
});
