import type { UserPlan, PlanConfig } from '$lib/types/user';

/**
 * Plan configurations with features and pricing
 */
export const PLANS: Record<UserPlan, PlanConfig> = {
	free: {
		name: 'Free',
		price: 0,
		description: 'Perfect for getting started',
		features: [
			'Join unlimited organizations',
			'RSVP to events',
			'Basic profile features',
			'Follow organizations'
		],
		canCreateOrganization: false
	},
	premium: {
		name: 'Premium',
		price: 9.99,
		description: 'For creators and organizers',
		features: [
			'Everything in Free',
			'Create and manage organizations',
			'Host unlimited events',
			'Advanced analytics',
			'Priority support',
			'Custom branding'
		],
		canCreateOrganization: true
	}
};

/**
 * Check if a user can create organizations based on their plan
 */
export function canCreateOrganization(userPlan: UserPlan): boolean {
	return PLANS[userPlan].canCreateOrganization;
}

/**
 * Get plan configuration by plan type
 */
export function getPlanConfig(plan: UserPlan): PlanConfig {
	return PLANS[plan];
}

/**
 * Check if a plan is premium
 */
export function isPremiumPlan(plan: UserPlan): boolean {
	return plan === 'premium';
}

/**
 * Get the upgrade target plan for a given plan
 */
export function getUpgradePlan(currentPlan: UserPlan): UserPlan | null {
	if (currentPlan === 'free') return 'premium';
	return null; // Already at highest tier
}
