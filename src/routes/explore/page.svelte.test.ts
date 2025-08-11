import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/explore/+page.svelte', () => {
	it('should render main heading', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		const heading = page.getByRole('heading', { level: 1, name: 'Explore' });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render hero section with description', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		const description = page.getByText('Find events and organizations near you');
		await expect.element(description).toBeInTheDocument();
	});

	it('should render events section heading', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		const eventsHeading = page.getByRole('heading', { level: 2, name: 'Upcoming Events' });
		await expect.element(eventsHeading).toBeInTheDocument();
	});

	it('should render organizations section heading', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		const orgsHeading = page.getByRole('heading', { level: 2, name: 'Featured Organizations' });
		await expect.element(orgsHeading).toBeInTheDocument();
	});

	it('should render "View all events" link', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		const viewAllEventsLink = page.getByRole('link', { name: 'View all events' });
		await expect.element(viewAllEventsLink).toBeInTheDocument();
		await expect.element(viewAllEventsLink).toHaveAttribute('href', '/explore/events');
	});

	it('should render "View all organizations" link', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		const viewAllOrgsLink = page.getByRole('link', { name: 'View all organizations' });
		await expect.element(viewAllOrgsLink).toBeInTheDocument();
		await expect.element(viewAllOrgsLink).toHaveAttribute('href', '/explore/orgs');
	});

	it('should render event titles when data is loaded', async () => {
		const mockData = {
			events: Promise.resolve([
				{
					id: '1',
					title: 'Test Event 1',
					description: 'Test event description',
					image: '/test-image.jpg'
				}
			]),
			orgs: Promise.resolve([])
		} as any;

		render(Page, { data: mockData });

		// Wait a bit for the promise to resolve
		await new Promise(resolve => setTimeout(resolve, 10));

		const eventTitle = page.getByText('Test Event 1');
		await expect.element(eventTitle).toBeInTheDocument();
	});

	it('should render organization names when data is loaded', async () => {
		const mockData = {
			events: Promise.resolve([]),
			orgs: Promise.resolve([
				{
					id: '1',
					name: 'Test Organization',
					slug: 'test-org',
					description: 'Test organization description',
					avatar: '/test-avatar.jpg'
				}
			])
		} as any;

		render(Page, { data: mockData });

		// Wait a bit for the promise to resolve
		await new Promise(resolve => setTimeout(resolve, 10));

		const orgName = page.getByRole('heading', { name: 'Test Organization' });
		await expect.element(orgName).toBeInTheDocument();
	});
});