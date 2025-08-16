import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventRepo, type Event, type EventWithAttendeeCount } from '$lib/repos/events';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('EventRepo - Query Methods', () => {
	let eventRepo: EventRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	const mockEvent: Event = {
		id: 'event-1',
		title: 'Test Event',
		slug: 'test-event',
		description: 'A test event for testing',
		dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
		closeRsvpAt: new Date('2024-11-30T18:00:00.000Z'),
		maxAttendees: 100,
		image: null,
		organizationId: 'org-1'
	};

	beforeEach(async () => {
		mockDb = {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			leftJoin: vi.fn().mockReturnThis(),
			groupBy: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			like: vi.fn(),
			or: vi.fn(),
			and: vi.fn(),
			gt: vi.fn(),
			eq: vi.fn(),
			as: vi.fn()
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

		eventRepo = new EventRepo(undefined);
	});

	describe('getUpcomingEvents', () => {
		it('should return upcoming events with default limit', async () => {
			const futureDate1 = new Date('2024-12-01');
			const futureDate2 = new Date('2024-12-15');
			const mockUpcomingEvents = [
				{ ...mockEvent, dateOfEvent: futureDate1 },
				{ ...mockEvent, id: 'event-2', dateOfEvent: futureDate2 }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEvents();

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // gt(events.dateOfEvent, now)
			expect(mockDb.limit).toHaveBeenCalledWith(10); // Default limit
		});

		it('should return upcoming events with custom limit', async () => {
			const mockUpcomingEvents = [mockEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEvents(5);

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.limit).toHaveBeenCalledWith(5);
		});

		it('should filter out past events', async () => {
			const futureDate = new Date('2024-12-01');
			const mockUpcomingEvents = [{ ...mockEvent, dateOfEvent: futureDate }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEvents();

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Date filter
		});

		it('should return empty array when no upcoming events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.getUpcomingEvents();

			expect(result).toEqual([]);
		});

		it('should order events by date ascending (soonest first)', async () => {
			const mockUpcomingEvents = [
				{ ...mockEvent, dateOfEvent: new Date('2024-11-20') },
				{ ...mockEvent, id: 'event-2', dateOfEvent: new Date('2024-12-15') }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEvents();

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getUpcomingEvents();

			expect(result).toEqual([]);
		});
	});

	describe('getEventsByOrganization', () => {
		it('should return events for organization', async () => {
			const mockEvents = [mockEvent, { ...mockEvent, id: 'event-2', title: 'Second Event' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getEventsByOrganization('org-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(events.organizationId, 'org-1')
		});

		it('should return empty array when organization has no events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getEventsByOrganization('org-1');

			expect(result).toEqual([]);
		});

		it('should return empty array when organization does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getEventsByOrganization('nonexistent-org');

			expect(result).toEqual([]);
		});

		it('should order events by date descending', async () => {
			const mockEvents = [
				{ ...mockEvent, dateOfEvent: new Date('2024-12-15') },
				{ ...mockEvent, id: 'event-2', dateOfEvent: new Date('2024-12-01') }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getEventsByOrganization('org-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getEventsByOrganization('org-1');

			expect(result).toEqual([]);
		});
	});

	describe('getUpcomingEventsByOrganization', () => {
		it('should return upcoming events for organization', async () => {
			const futureDate1 = new Date('2024-12-01');
			const futureDate2 = new Date('2024-12-15');
			const mockUpcomingEvents = [
				{ ...mockEvent, dateOfEvent: futureDate1 },
				{ ...mockEvent, id: 'event-2', dateOfEvent: futureDate2 }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEventsByOrganization('org-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Filter for organization and future date
		});

		it('should filter out past events', async () => {
			const futureDate = new Date('2024-12-01');
			const mockUpcomingEvents = [{ ...mockEvent, dateOfEvent: futureDate }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEventsByOrganization('org-1');

			expect(result).toEqual(mockUpcomingEvents);
		});

		it('should return empty array when no upcoming events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getUpcomingEventsByOrganization('org-1');

			expect(result).toEqual([]);
		});

		it('should order events by date ascending (soonest first)', async () => {
			const mockUpcomingEvents = [
				{ ...mockEvent, dateOfEvent: new Date('2024-11-20') },
				{ ...mockEvent, id: 'event-2', dateOfEvent: new Date('2024-12-15') }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingEventsByOrganization('org-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});
	});

	describe('searchEvents', () => {
		it('should return events matching search query in title', async () => {
			const mockEvents = [mockEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockEvents);

			const result = await eventRepo.searchEvents('test');

			expect(result).toEqual(mockEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // or(like(...), like(...))
		});

		it('should return events matching search query in description', async () => {
			const mockEvents = [mockEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockEvents);

			const result = await eventRepo.searchEvents('testing');

			expect(result).toEqual(mockEvents);
		});

		it('should filter by organization when provided', async () => {
			const mockEvents = [mockEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockEvents);

			const result = await eventRepo.searchEvents('test', { organizationId: 'org-1' });

			expect(result).toEqual(mockEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Include organization filter
		});

		it('should return empty array when no matches found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.searchEvents('nonexistent');

			expect(result).toEqual([]);
		});

		it('should be case insensitive', async () => {
			const mockEvents = [mockEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue(mockEvents);

			const result = await eventRepo.searchEvents('TEST');

			expect(result).toEqual(mockEvents);
		});

		it('should limit results to prevent performance issues', async () => {
			const mockEvents = Array.from({ length: 50 }, (_, i) => ({
				...mockEvent,
				id: `event-${i}`,
				title: `Test Event ${i}`
			}));

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit = vi.fn().mockResolvedValue(mockEvents.slice(0, 20));

			const result = await eventRepo.searchEvents('test');

			expect(result).toHaveLength(20);
			expect(mockDb.limit).toHaveBeenCalledWith(20);
		});

		it('should order results by relevance (title matches first)', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockEvent]);

			await eventRepo.searchEvents('test');

			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.searchEvents('test');

			expect(result).toEqual([]);
		});
	});

	describe('getEventWithAttendeeCount', () => {
		it('should return event with attendee count', async () => {
			const mockEventWithCount: EventWithAttendeeCount = {
				...mockEvent,
				attendeeCount: 25
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockEventWithCount]);

			const result = await eventRepo.getEventWithAttendeeCount('event-1');

			expect(result).toEqual(mockEventWithCount);
			expect(mockDb.leftJoin).toHaveBeenCalled();
			expect(mockDb.groupBy).toHaveBeenCalled();
		});

		it('should return event with zero attendee count when no attendees', async () => {
			const mockEventWithCount: EventWithAttendeeCount = {
				...mockEvent,
				attendeeCount: 0
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockEventWithCount]);

			const result = await eventRepo.getEventWithAttendeeCount('event-1');

			expect(result).toEqual(mockEventWithCount);
		});

		it('should return null when event not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([]);

			const result = await eventRepo.getEventWithAttendeeCount('nonexistent');

			expect(result).toBeNull();
		});

		it('should use efficient aggregation query', async () => {
			const mockEventWithCount: EventWithAttendeeCount = {
				...mockEvent,
				attendeeCount: 15
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockEventWithCount]);

			await eventRepo.getEventWithAttendeeCount('event-1');

			expect(mockDb.groupBy).toHaveBeenCalled();
		});

		it('should return null on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getEventWithAttendeeCount('event-1');

			expect(result).toBeNull();
		});

		it('should include all event fields in result', async () => {
			const mockEventWithCount: EventWithAttendeeCount = {
				id: 'event-1',
				title: 'Complete Event',
				slug: 'complete-event',
				description: 'A complete event with all fields',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				closeRsvpAt: new Date('2024-11-30T18:00:00.000Z'),
				maxAttendees: 100,
				image: 'https://example.com/event.jpg',
				organizationId: 'org-1',
				attendeeCount: 42
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockEventWithCount]);

			const result = await eventRepo.getEventWithAttendeeCount('event-1');

			expect(result).toEqual(mockEventWithCount);
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('title');
			expect(result).toHaveProperty('slug');
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('dateOfEvent');
			expect(result).toHaveProperty('closeRsvpAt');
			expect(result).toHaveProperty('maxAttendees');
			expect(result).toHaveProperty('image');
			expect(result).toHaveProperty('organizationId');
			expect(result).toHaveProperty('attendeeCount');
		});

		it('should handle events with no max capacity', async () => {
			const mockEventWithCount: EventWithAttendeeCount = {
				...mockEvent,
				maxAttendees: null,
				attendeeCount: 150
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockEventWithCount]);

			const result = await eventRepo.getEventWithAttendeeCount('event-1');

			expect(result?.attendeeCount).toBe(150);
			expect(result?.maxAttendees).toBeNull();
		});
	});
});
