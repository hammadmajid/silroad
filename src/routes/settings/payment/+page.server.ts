import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDb } from '$lib/db';
import { users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleLoginRedirect } from '$lib/utils/redirect';

export const load: PageServerLoad = async (event) => {
	const { platform, locals } = event;
	const db = getDb(platform);

	const localUser = locals.user;

	if (!localUser) {
		throw redirect(303, handleLoginRedirect(event));
	}

	// Get user with plan information
	const userWithPlan = await db
		.select({
			plan: users.plan
		})
		.from(users)
		.where(eq(users.id, localUser.id))
		.limit(1);

	const userPlan = userWithPlan[0]?.plan || 'free';

	return {
		userPlan
	};
};

export const actions: Actions = {
	upgrade: async ({ request, platform, locals }) => {
		const db = getDb(platform);
		const localUser = locals.user;

		if (!localUser) {
			throw redirect(303, '/login');
		}

		const data = await request.formData();
		const plan = data.get('plan') as string;

		if (plan !== 'premium') {
			return fail(400, { error: 'Invalid plan selected' });
		}

		try {
			// In a real app, this is where you'd:
			// 1. Process payment with Stripe/PayPal
			// 2. Verify payment success
			// 3. Update user plan in database

			// For MVP demo purposes, we'll just update the plan directly
			await db.update(users).set({ plan: 'premium' }).where(eq(users.id, localUser.id));

			// Simulate processing time
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return {
				success: true,
				message: 'Successfully upgraded to Premium! Welcome to premium features.'
			};
		} catch (error) {
			console.error('Plan upgrade error:', error);
			return fail(500, { error: 'Failed to upgrade plan. Please try again.' });
		}
	},

	downgrade: async ({ platform, locals }) => {
		const db = getDb(platform);
		const localUser = locals.user;

		if (!localUser) {
			throw redirect(303, '/login');
		}

		try {
			// In a real app, this is where you'd:
			// 1. Cancel subscription with payment provider
			// 2. Handle prorated refunds if applicable
			// 3. Set plan to expire at end of billing period

			// For MVP demo purposes, we'll downgrade immediately
			await db.update(users).set({ plan: 'free' }).where(eq(users.id, localUser.id));

			// Simulate processing time
			await new Promise((resolve) => setTimeout(resolve, 1000));

			return {
				success: true,
				message: 'Successfully downgraded to Free plan. You can upgrade again anytime.'
			};
		} catch (error) {
			console.error('Plan downgrade error:', error);
			return fail(500, { error: 'Failed to downgrade plan. Please try again.' });
		}
	}
};
