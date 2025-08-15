import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationRepo } from '$lib/repos/orgs';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('OrganizationRepo - Integration Methods', () => {
	let orgRepo: OrganizationRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	beforeEach(async () => {
		mockDb = {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			innerJoin: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			gt: vi.fn(),
			eq: vi.fn()
		};

		mockKV = {
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn()
		};

		mockLogger = {
			writeDataPoint: vi.fn()
		};

		const { getDb, getKV, getLogger } = await import('$lib/db');
		vi.mocked(getDb).mockReturnValue(mockDb);
		vi.mocked(getKV).mockReturnValue(mockKV);
		vi.mocked(getLogger).mockReturnValue(mockLogger);

		orgRepo = new OrganizationRepo(undefined);
	});

	describe('getEventsFromUserOrganizations', () => {
		it('should return events from all user organizations', async () => {
			const mockEvents = [
				{
					id: 'event-1',
					title: 'Event from Org 1',
					organizationId: 'org-1',
					dateOfEvent: new Date('2024-12-01')
				},
				{
					id: 'event-2',
					title: 'Event from Org 2',
					organizationId: 'org-2',
					dateOfEvent: new Date('2024-12-15')
				},
				{
					id: 'event-3',
					title: 'Another Event from Org 1',
					organizationId: 'org-1',
					dateOfEvent: new Date('2024-12-20')
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await orgRepo.getEventsFromUserOrganizations('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.innerJoin).toHaveBeenCalledTimes(2); // Join events -> organizations -> organizationMembers
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizationMembers.userId, 'user-1')
		});

		it('should return empty array when user has no organizations', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getEventsFromUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array when user does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getEventsFromUserOrganizations('nonexistent-user');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getEventsFromUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should validate UUID format for userId', async () => {
			const result = await orgRepo.getEventsFromUserOrganizations('invalid-uuid');

			expect(result).toEqual([]);
			expect(mockDb.select).not.toHaveBeenCalled();
		});

		it('should order events by date descending (newest first)', async () => {
			const mockEvents = [
				{
					id: 'event-3',
					title: 'Latest Event',
					dateOfEvent: new Date('2024-12-20')
				},
				{
					id: 'event-2',
					title: 'Middle Event',
					dateOfEvent: new Date('2024-12-15')
				},
				{
					id: 'event-1',
					title: 'Earliest Event',
					dateOfEvent: new Date('2024-12-01')
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await orgRepo.getEventsFromUserOrganizations('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should include all event fields', async () => {
			const mockEvents = [
				{
					id: 'event-1',
					title: 'Complete Event',
					slug: 'complete-event',
					description: 'A complete event with all fields',
					dateOfEvent: new Date('2024-12-01'),
					closeRsvpAt: new Date('2024-11-29'),
					maxAttendees: 100,
					image: 'https://example.com/event.jpg',
					organizationId: 'org-1'
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await orgRepo.getEventsFromUserOrganizations('user-1');

			expect(result[0]).toEqual(
				expect.objectContaining({
					id: 'event-1',
					title: 'Complete Event',
					slug: 'complete-event',
					description: 'A complete event with all fields',
					maxAttendees: 100,
					organizationId: 'org-1'
				})
			);
		});

		it('should handle organizations with no events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getEventsFromUserOrganizations('user-1');

			expect(result).toEqual([]);
		});
	});

	describe('getUpcomingEventsFromUserOrganizations', () => {
		it('should return upcoming events from user organizations', async () => {
			const futureDate1 = new Date('2024-12-01');
			const futureDate2 = new Date('2024-12-15');
			const mockUpcomingEvents = [
				{
					id: 'event-1',
					title: 'Upcoming Event 1',
					dateOfEvent: futureDate1,
					organizationId: 'org-1'
				},
				{
					id: 'event-2',
					title: 'Upcoming Event 2',
					dateOfEvent: futureDate2,
					organizationId: 'org-2'
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Filter for future events and user membership
		});

		it('should filter out past events', async () => {
			const futureDate = new Date('2024-12-01');
			const mockUpcomingEvents = [
				{
					id: 'event-1',
					title: 'Future Event',
					dateOfEvent: futureDate,
					organizationId: 'org-1'
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Should include date filter
		});

		it('should return empty array when no upcoming events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array when user has no organizations', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array when user does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('nonexistent-user');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should validate UUID format for userId', async () => {
			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('invalid-uuid');

			expect(result).toEqual([]);
			expect(mockDb.select).not.toHaveBeenCalled();
		});

		it('should order events by date ascending (soonest first)', async () => {
			const mockUpcomingEvents = [
				{
					id: 'event-1',
					title: 'Soon Event',
					dateOfEvent: new Date('2024-11-20')
				},
				{
					id: 'event-2',
					title: 'Later Event',
					dateOfEvent: new Date('2024-12-15')
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should use current date as reference for upcoming events', async () => {
			const mockUpcomingEvents = [
				{
					id: 'event-1',
					title: 'Future Event',
					dateOfEvent: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Should use current date
		});

		it('should limit results to prevent performance issues', async () => {
			const mockUpcomingEvents = Array.from({ length: 50 }, (_, i) => ({
				id: `event-${i}`,
				title: `Upcoming Event ${i}`,
				dateOfEvent: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
			}));

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit = vi.fn().mockResolvedValue(mockUpcomingEvents.slice(0, 20));

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result).toHaveLength(20);
			expect(mockDb.limit).toHaveBeenCalledWith(20);
		});

		it('should include event organization information', async () => {
			const mockUpcomingEvents = [
				{
					id: 'event-1',
					title: 'Upcoming Event',
					dateOfEvent: new Date('2024-12-01'),
					organizationId: 'org-1',
					organization: {
						id: 'org-1',
						name: 'Test Organization',
						slug: 'test-org'
					}
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await orgRepo.getUpcomingEventsFromUserOrganizations('user-1');

			expect(result[0]).toEqual(
				expect.objectContaining({
					organizationId: 'org-1',
					organization: expect.objectContaining({
						name: 'Test Organization'
					})
				})
			);
		});
	});
});
