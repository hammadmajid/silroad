import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Event } from '$lib/types';
import { EventRepo } from '$lib/repos/events';

vi.mock('$lib/db', () => ({
	getDb: vi.fn()
}));

vi.mock('$lib/utils/logger', () => ({
	Logger: vi.fn().mockImplementation(() => ({
		error: vi.fn()
	}))
}));

describe('EventRepo - User Following Events', () => {
	let eventRepo: EventRepo;
	let mockDb: any;

	const mockEvents: Event[] = [
		{
			id: 'event-1',
			title: 'Tech Conference 2024',
			slug: 'tech-conference-2024',
			description: 'Annual tech conference',
			dateOfEvent: new Date('2024-06-15T10:00:00Z'),
			closeRsvpAt: new Date('2024-06-10T23:59:59Z'),
			maxAttendees: 100,
			image: 'https://example.com/tech-conf.jpg',
			organizationId: 'org-1'
		},
		{
			id: 'event-2',
			title: 'Workshop: React Best Practices',
			slug: 'react-workshop',
			description: 'Learn React best practices',
			dateOfEvent: new Date('2024-07-20T14:00:00Z'),
			closeRsvpAt: null,
			maxAttendees: null,
			image: 'https://example.com/react-workshop.jpg',
			organizationId: 'org-2'
		}
	];

	beforeEach(async () => {
		mockDb = {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			innerJoin: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis()
		};

		const { getDb } = await import('$lib/db');
		vi.mocked(getDb).mockReturnValue(mockDb);

		eventRepo = new EventRepo(undefined);
	});

	describe('getEventsFromUserFollowedOrgs', () => {
		it('should return events from organizations user follows', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizationFollowers.userId, 'user-1')
		});

		it('should return empty array when user follows no organizations', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database connection failed'));

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			expect(result).toEqual([]);
		});

		it('should handle mixed valid and invalid event data', async () => {
			const validEvent = mockEvents[0];
			const invalidEvent = { ...mockEvents[1] };
			delete (invalidEvent as any).id; // Remove required field to make it invalid

			const mockResults = [validEvent, invalidEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockResults);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			// Should include both valid and invalid events since filter only checks for null/undefined
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual(validEvent);
		});

		it('should return correctly typed Event objects', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			result.forEach((event) => {
				expect(event).toHaveProperty('id');
				expect(event).toHaveProperty('title');
				expect(event).toHaveProperty('slug');
				expect(event).toHaveProperty('description');
				expect(event).toHaveProperty('dateOfEvent');
				expect(event).toHaveProperty('organizationId');
				expect(typeof event.id).toBe('string');
				expect(typeof event.title).toBe('string');
				expect(typeof event.slug).toBe('string');
				expect(typeof event.organizationId).toBe('string');
			});
		});

		it('should handle events with various date formats', async () => {
			const eventsWithDates = [
				{
					...mockEvents[0],
					dateOfEvent: new Date('2024-12-25T00:00:00Z')
				},
				{
					...mockEvents[1],
					dateOfEvent: new Date('2025-01-01T12:30:00Z')
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(eventsWithDates);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			expect(result).toHaveLength(2);
			result.forEach((event) => {
				expect(event.dateOfEvent).toBeInstanceOf(Date);
			});
		});

		it('should handle events with optional fields as null', async () => {
			const eventWithNulls = {
				id: 'event-minimal',
				title: 'Minimal Event',
				slug: 'minimal-event',
				description: null,
				dateOfEvent: new Date('2024-08-15T15:00:00Z'),
				closeRsvpAt: null,
				maxAttendees: null,
				image: null,
				organizationId: 'org-1'
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([eventWithNulls]);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-1');

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual(eventWithNulls);
			expect(result[0].description).toBeNull();
			expect(result[0].closeRsvpAt).toBeNull();
			expect(result[0].maxAttendees).toBeNull();
			expect(result[0].image).toBeNull();
		});

		it('should work with users who have no followed organizations', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getEventsFromUserFollowedOrgs('user-with-no-follows');

			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});
});
