import type { Page } from '@sveltejs/kit';

export interface BreadcrumbItem {
	label: string;
	href?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateBreadcrumbs(page: Page, pageData?: Record<string, any>): BreadcrumbItem[] {
	const { pathname } = page.url;
	const segments = pathname.split('/').filter(Boolean);
	const breadcrumbs: BreadcrumbItem[] = [];

	// Always start with Home
	breadcrumbs.push({ label: 'Home', href: '/' });

	// Handle specific routes
	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		const isLast = i === segments.length - 1;

		switch (segment) {
			case 'explore':
				breadcrumbs.push({
					label: 'Explore',
					href: isLast ? undefined : '/explore'
				});
				break;

			case 'events':
				if (segments[i - 1] === 'explore') {
					breadcrumbs.push({
						label: 'Events',
						href: isLast ? undefined : '/explore/events'
					});
				}
				break;

			case 'orgs':
				if (segments[i - 1] === 'explore') {
					breadcrumbs.push({
						label: 'Organizations',
						href: isLast ? undefined : '/explore/orgs'
					});
				}
				break;

			case 'settings':
				breadcrumbs.push({
					label: 'Settings',
					href: isLast ? undefined : '/settings'
				});
				break;

			case 'profile':
				if (segments[i - 1] === 'settings') {
					breadcrumbs.push({
						label: 'Profile',
						href: isLast ? undefined : '/settings/profile'
					});
				}
				break;

			case 'account':
				if (segments[i - 1] === 'settings') {
					breadcrumbs.push({
						label: 'Account',
						href: isLast ? undefined : '/settings/account'
					});
				}
				break;

			case 'appearance':
				if (segments[i - 1] === 'settings') {
					breadcrumbs.push({
						label: 'Appearance',
						href: isLast ? undefined : '/settings/appearance'
					});
				}
				break;

			case 'notifications':
				if (segments[i - 1] === 'settings') {
					breadcrumbs.push({
						label: 'Notifications',
						href: isLast ? undefined : '/settings/notifications'
					});
				}
				break;

			case 'organization':
				if (segments[i - 1] === 'settings') {
					breadcrumbs.push({
						label: 'Organization',
						href: isLast ? undefined : '/settings/organization'
					});
				}
				break;

			case 'payment':
				if (segments[i - 1] === 'settings') {
					breadcrumbs.push({
						label: 'Payment',
						href: isLast ? undefined : '/settings/payment'
					});
				}
				break;

			case 'about':
				breadcrumbs.push({
					label: 'About',
					href: isLast ? undefined : '/about'
				});
				break;

			case 'help':
				breadcrumbs.push({
					label: 'Help',
					href: isLast ? undefined : '/help'
				});
				break;

			case 'privacy':
				breadcrumbs.push({
					label: 'Privacy',
					href: isLast ? undefined : '/privacy'
				});
				break;

			case 'terms':
				breadcrumbs.push({
					label: 'Terms',
					href: isLast ? undefined : '/terms'
				});
				break;

			case 'login':
				breadcrumbs.push({
					label: 'Login',
					href: isLast ? undefined : '/login'
				});
				break;

			case 'register':
				breadcrumbs.push({
					label: 'Register',
					href: isLast ? undefined : '/register'
				});
				break;

			default:
				// Handle dynamic segments like [slug]
				if (isLast && pageData) {
					// For event pages
					if (segments[i - 1] === 'events' && pageData?.event) {
						breadcrumbs.push({
							label: pageData.event.title
						});
					}
					// For organization pages
					else if (segments[i - 1] === 'orgs' && pageData?.organization) {
						breadcrumbs.push({
							label: pageData.organization.name
						});
					}
					// Generic fallback - let component handle formatting
					else {
						breadcrumbs.push({
							label: segment
						});
					}
				}
				break;
		}
	}

	return breadcrumbs;
}
