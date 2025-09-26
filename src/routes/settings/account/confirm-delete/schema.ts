import { z } from 'zod/v4';

export const schema = z.object({
	password: z.string().min(1, 'Password is required to confirm deletion.'),
	confirmText: z.string().refine((val) => val === 'DELETE', {
		message: 'Please type "DELETE" to confirm account deletion.'
	})
});
