import { z } from 'zod/v4';

export const schema = z.object({
	email: z.email('Please enter a valid email.'),
	password: z.string().min(1, 'Password is required.'),
	'cf-turnstile-response': z.string().nonempty('Please complete turnstile')
});
