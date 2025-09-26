import { z } from 'zod/v4';

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

export const schema = z.object({
	name: z.string().min(1, 'Name is required.').max(100, 'Name must be less than 100 characters.'),
	image: z
		.instanceof(File)
		.refine((file) => file.size === 0 || file.size <= MAX_FILE_SIZE, 'Max image size is 5MB.')
		.refine(
			(file) =>
				file.size === 0 ||
				['image/png', 'image/jpeg', 'image/webp', 'image/avif'].includes(file.type),
			'Only PNG, JPEG, WebP, and AVIF formats are supported.'
		)
		.optional()
});
