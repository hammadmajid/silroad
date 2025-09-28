import { z } from 'zod/v4';

export const schema = z
	.object({
		password: z
			.string()
			.regex(
				/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/,
				'Password must be 8+ chars, with letters, numbers and special.'
			),
		confirmPassword: z.string().min(1, 'Please confirm your password.')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords must match.',
		path: ['confirmPassword']
	});
