import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/explore/events/+page.svelte', () => {
	const mockData = {
		events: [
			{
				id: '1',
				title: 'Test Event 1',
				description: 'Test event description',
				dateOfEvent: new Date(),
				closeRsvpAt: null,
				maxAttendees: null,
				image: '/test-image.jpg',
				organizationId: 'org1'
			},
			{
				id: '2',
				title: 'Test Event 2', 
				description: 'Another test event',
				dateOfEvent: new Date(),
				closeRsvpAt: null,
				maxAttendees: null,
				image: '/test-image2.jpg',
				organizationId: 'org1'
			}
		],
		pagination: {
			page: 1,
			pageSize: 10,
			totalCount: 25,
			totalPages: 3
		}
	};

	it('should render main heading', async () => {
		render(Page, { data: mockData });

		const heading = page.getByRole('heading', { level: 1, name: 'All Events' });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render hero section with description', async () => {
		render(Page, { data: mockData });

		const description = page.getByText('Discover all exciting events happening around you');
		await expect.element(description).toBeInTheDocument();
	});

	it('should render event cards', async () => {
		render(Page, { data: mockData });

		const event1Title = page.getByText('Test Event 1');
		const event2Title = page.getByText('Test Event 2');
		
		await expect.element(event1Title).toBeInTheDocument();
		await expect.element(event2Title).toBeInTheDocument();
	});

	it('should render event descriptions', async () => {
		render(Page, { data: mockData });

		const description1 = page.getByText('Test event description');
		const description2 = page.getByText('Another test event');
		
		await expect.element(description1).toBeInTheDocument();
		await expect.element(description2).toBeInTheDocument();
	});

	it('should show empty state when no events', async () => {
		const emptyData = {
			events: [],
			pagination: {
				page: 1,
				pageSize: 10,
				totalCount: 0,
				totalPages: 0
			}
		};

		render(Page, { data: emptyData });

		const emptyMessage = page.getByText('No events found.');
		await expect.element(emptyMessage).toBeInTheDocument();
	});

	it('should render correct page title', async () => {
		render(Page, { data: mockData });

		expect(document.title).toBe('Events | Silroad');
	});
});