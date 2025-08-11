import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/explore/orgs/+page.svelte', () => {
	const mockData = {
		orgs: [
			{
				id: '1',
				name: 'Test Organization 1',
				slug: 'test-org-1',
				description: 'Test organization description',
				avatar: '/test-avatar.jpg',
				backgroundImage: null
			},
			{
				id: '2',
				name: 'Test Organization 2',
				slug: 'test-org-2', 
				description: 'Another test organization',
				avatar: '/test-avatar2.jpg',
				backgroundImage: null
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

		const heading = page.getByRole('heading', { level: 1, name: 'All Organizations' });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should render hero section with description', async () => {
		render(Page, { data: mockData });

		const description = page.getByText('Connect with all organizations making a difference');
		await expect.element(description).toBeInTheDocument();
	});

	it('should render organization cards', async () => {
		render(Page, { data: mockData });

		const org1Name = page.getByText('Test Organization 1');
		const org2Name = page.getByText('Test Organization 2');
		
		await expect.element(org1Name).toBeInTheDocument();
		await expect.element(org2Name).toBeInTheDocument();
	});

	it('should render organization descriptions', async () => {
		render(Page, { data: mockData });

		const description1 = page.getByText('Test organization description');
		const description2 = page.getByText('Another test organization');
		
		await expect.element(description1).toBeInTheDocument();
		await expect.element(description2).toBeInTheDocument();
	});

	it('should show empty state when no organizations', async () => {
		const emptyData = {
			orgs: [],
			pagination: {
				page: 1,
				pageSize: 10,
				totalCount: 0,
				totalPages: 0
			}
		};

		render(Page, { data: emptyData });

		const emptyMessage = page.getByText('No organizations found.');
		await expect.element(emptyMessage).toBeInTheDocument();
	});

	it('should render correct page title', async () => {
		render(Page, { data: mockData });

		expect(document.title).toBe('Organizations | Silroad');
	});
});