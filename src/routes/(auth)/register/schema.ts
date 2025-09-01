import { z } from 'zod/v4';

export const schema = z.object({
	firstName: z.string().min(1, 'Enter a valid name'),
	lastName: z.string().min(1, 'Enter a valid name'),
	email: z.email('Enter a valid email.'),
	password: z
		.string()
		.regex(
			/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/,
			'Password must be 8+ chars, with letters, numbers and special.'
		),
	agree: z.boolean().refine((val) => val === true, {
		message: 'You must agree to the terms'
	}),
	'cf-turnstile-response': z.string().nonempty('Please complete turnstile')
});
