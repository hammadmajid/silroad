import { z } from 'zod/v4';

export const schema = z.object({
	firstName: z.string().min(1, 'Please enter a valid name'),
	lastName: z.string().min(1, 'Please enter a valid name'),
	email: z.email('Please enter a valid email.'),
	password: z
		.string()
		.regex(
			/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
			'Password must be at least 8 characters long and contain both letters and numbers.'
		),
	agree: z.boolean().refine((val) => val === true, {
		message: 'You must agree to the Terms and Privacy Policy'
	})
});
