import { z } from 'zod/v4';

export const schema = z
	.object({
		currentPassword: z.string().min(1, 'Current password is required.'),
		newPassword: z
			.string()
			.regex(
				/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/,
				'Password must be 8+ chars, with letters, numbers and special.'
			),
		confirmPassword: z.string()
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match.',
		path: ['confirmPassword']
	});
