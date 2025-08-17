import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventRepo } from '$lib/repos/events';
import type { Event } from '$lib/types';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('EventRepo - Organizer Management', () => {
	let eventRepo: EventRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	const mockEvent: Event = {
		id: 'event-1',
		title: 'Test Event',
		slug: 'test-event',
		description: 'A test event',
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
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returning: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			innerJoin: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			eq: vi.fn(),
			and: vi.fn(),
			gt: vi.fn()
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

	describe('addOrganizer', () => {
		it('should add organizer successfully', async () => {
			// Mock event exists
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValueOnce([mockEvent]); // Event lookup

			// Mock successful insertion
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([{ eventId: 'event-1', userId: 'user-1' }]);

			const result = await eventRepo.addOrganizer('event-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalledWith({
				eventId: 'event-1',
				userId: 'user-1'
			});
		});

		it('should return false on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.addOrganizer('event-1', 'user-1');

			expect(result).toBe(false);
		});
	});

	describe('removeOrganizer', () => {
		it('should remove organizer successfully', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue({ changes: 1 });

			const result = await eventRepo.removeOrganizer('event-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it('should prevent removing the last organizer', async () => {
			// Mock that user is the only organizer
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockResolvedValue([{ count: 1 }])
			});

			const result = await eventRepo.removeOrganizer('event-1', 'user-1');

			expect(result).toBe(false);
			expect(mockDb.delete).not.toHaveBeenCalled();
		});

		it('should allow removing organizer when multiple organizers exist', async () => {
			// Mock that there are multiple organizers
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockResolvedValue([{ count: 3 }])
			});

			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue({ changes: 1 });

			const result = await eventRepo.removeOrganizer('event-1', 'user-1');

			expect(result).toBe(true);
		});

		it('should return false on database error', async () => {
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockRejectedValue(new Error('Database error'))
			});

			const result = await eventRepo.removeOrganizer('event-1', 'user-1');

			expect(result).toBe(false);
		});
	});

	describe('getOrganizers', () => {
		it('should return list of organizer user IDs', async () => {
			const mockOrganizers = [{ userId: 'user-1' }, { userId: 'user-2' }, { userId: 'user-3' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrganizers);

			const result = await eventRepo.getOrganizers('event-1');

			expect(result).toEqual(['user-1', 'user-2', 'user-3']);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(eventOrganizers.eventId, 'event-1')
		});

		it('should return empty array when no organizers', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getOrganizers('event-1');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getOrganizers('event-1');

			expect(result).toEqual([]);
		});
	});

	describe('getUserOrganizedEvents', () => {
		it('should return events user is organizing', async () => {
			const mockEvents = [mockEvent, { ...mockEvent, id: 'event-2', title: 'Second Event' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getUserOrganizedEvents('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.innerJoin).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(eventOrganizers.userId, 'user-1')
		});

		it('should return empty array when user organizes no events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getUserOrganizedEvents('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getUserOrganizedEvents('user-1');

			expect(result).toEqual([]);
		});

		it('should order events by date descending', async () => {
			const mockEvents = [
				{ ...mockEvent, dateOfEvent: new Date('2024-12-15') },
				{ ...mockEvent, id: 'event-2', dateOfEvent: new Date('2024-12-01') }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getUserOrganizedEvents('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should include events from multiple organizations', async () => {
			const mockEvents = [
				{ ...mockEvent, organizationId: 'org-1' },
				{ ...mockEvent, id: 'event-2', organizationId: 'org-2' }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getUserOrganizedEvents('user-1');

			expect(result).toEqual(mockEvents);
		});
	});

	describe('isOrganizer', () => {
		it('should return true when user is organizer', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ userId: 'user-1' }]);

			const result = await eventRepo.isOrganizer('event-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // and(eq(...), eq(...))
		});

		it('should return false when user is not organizer', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.isOrganizer('event-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should return false on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.isOrganizer('event-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should use efficient single query with limit 1', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ userId: 'user-1' }]);

			await eventRepo.isOrganizer('event-1', 'user-1');

			expect(mockDb.limit).toHaveBeenCalledWith(1);
		});

		it('should check organization membership for implicit organizer access', async () => {
			// Mock user is not explicit organizer
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValueOnce([]); // Not explicit organizer

			// Mock user is member of event organization
			mockDb.limit.mockResolvedValueOnce([{ userId: 'user-1' }]); // Organization member

			const result = await eventRepo.isOrganizer('event-1', 'user-1');

			expect(result).toBe(true);
		});

		it('should return false when user is neither organizer nor org member', async () => {
			// Mock user is not explicit organizer
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValueOnce([]); // Not explicit organizer

			// Mock user is not member of event organization
			mockDb.limit.mockResolvedValueOnce([]); // Not organization member

			const result = await eventRepo.isOrganizer('event-1', 'user-1');

			expect(result).toBe(false);
		});
	});
});
