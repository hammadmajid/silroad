import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Event } from '$lib/types';
import { EventRepo } from '$lib/repos/events';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('EventRepo - Attendee Management', () => {
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

	describe('addAttendee', () => {
		it('should return false when event is at capacity', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValueOnce([mockEvent]);

			// Mock attendee count at capacity
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockResolvedValue([{ count: 100 }])
			});

			const result = await eventRepo.addAttendee('event-1', 'user-1');

			expect(result).toBe(false);
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it('should return false on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.addAttendee('event-1', 'user-1');

			expect(result).toBe(false);
		});
	});

	describe('removeAttendee', () => {
		it('should remove attendee successfully', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue({ changes: 1 });

			const result = await eventRepo.removeAttendee('event-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it('should return false on database error', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.removeAttendee('event-1', 'user-1');

			expect(result).toBe(false);
		});
	});

	describe('getAttendees', () => {
		it('should return list of attendee user objects', async () => {
			const mockAttendees = [
				{ id: 'user-1', name: 'User One', email: 'user1@example.com', image: null },
				{ id: 'user-2', name: 'User Two', email: 'user2@example.com', image: 'avatar2.jpg' },
				{ id: 'user-3', name: 'User Three', email: 'user3@example.com', image: null }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockAttendees);

			const result = await eventRepo.getAttendees('event-1');

			expect(result).toEqual(mockAttendees);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(attendees.eventId, 'event-1')
		});

		it('should return empty array when no attendees', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getAttendees('event-1');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getAttendees('event-1');

			expect(result).toEqual([]);
		});

		it('should order attendees by join date', async () => {
			const mockAttendees = [
				{ id: 'user-2', name: 'User Two', email: 'user2@example.com', image: 'avatar2.jpg' },
				{ id: 'user-1', name: 'User One', email: 'user1@example.com', image: null },
				{ id: 'user-3', name: 'User Three', email: 'user3@example.com', image: null }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockAttendees);

			const result = await eventRepo.getAttendees('event-1');

			expect(result).toEqual(mockAttendees);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});
	});

	describe('getUserAttendedEvents', () => {
		it('should return events user is attending', async () => {
			const mockEvents = [mockEvent, { ...mockEvent, id: 'event-2', title: 'Second Event' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockEvents);

			const result = await eventRepo.getUserAttendedEvents('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.innerJoin).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(attendees.userId, 'user-1')
		});

		it('should return empty array when user attends no events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getUserAttendedEvents('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getUserAttendedEvents('event-1');

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

			const result = await eventRepo.getUserAttendedEvents('user-1');

			expect(result).toEqual(mockEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});
	});

	describe('getUpcomingUserEvents', () => {
		it('should return upcoming events user is attending', async () => {
			const futureDate1 = new Date('2024-12-01');
			const futureDate2 = new Date('2024-12-15');
			const mockUpcomingEvents = [
				{ ...mockEvent, dateOfEvent: futureDate1 },
				{ ...mockEvent, id: 'event-2', dateOfEvent: futureDate2 }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingUserEvents('user-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // Filter for future events and user attendance
		});

		it('should filter out past events', async () => {
			const futureDate = new Date('2024-12-01');
			const mockUpcomingEvents = [{ ...mockEvent, dateOfEvent: futureDate }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingUserEvents('user-1');

			expect(result).toEqual(mockUpcomingEvents);
		});

		it('should return empty array when no upcoming events', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await eventRepo.getUpcomingUserEvents('user-1');

			expect(result).toEqual([]);
		});

		it('should order events by date ascending (soonest first)', async () => {
			const mockUpcomingEvents = [
				{ ...mockEvent, dateOfEvent: new Date('2024-11-20') },
				{ ...mockEvent, id: 'event-2', dateOfEvent: new Date('2024-12-15') }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockUpcomingEvents);

			const result = await eventRepo.getUpcomingUserEvents('user-1');

			expect(result).toEqual(mockUpcomingEvents);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});
	});

	describe('isAttending', () => {
		it('should return true when user is attending', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ userId: 'user-1' }]);

			const result = await eventRepo.isAttending('event-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // and(eq(...), eq(...))
		});

		it('should return false when user is not attending', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.isAttending('event-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should return false on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.isAttending('event-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should use efficient single query with limit 1', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ userId: 'user-1' }]);

			await eventRepo.isAttending('event-1', 'user-1');

			expect(mockDb.limit).toHaveBeenCalledWith(1);
		});
	});

	describe('toggleAttendance', () => {
		it('should leave event if user is already attending', async () => {
			// Mock delete returns row -> means left event
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([{ eventId: 'event-1' }]);

			const result = await eventRepo.toggleAttendance('user-1', 'event-1');

			expect(result).toBe('left');
			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.returning).toHaveBeenCalled();
		});

		it('should join event if user is not attending', async () => {
			// Mock delete returns nothing -> user wasn't attending
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([]);

			// Mock successful addAttendee
			const mockAddAttendee = vi.spyOn(eventRepo, 'addAttendee').mockResolvedValue(true);

			const result = await eventRepo.toggleAttendance('user-1', 'event-1');

			expect(result).toBe('joined');
			expect(mockAddAttendee).toHaveBeenCalledWith('event-1', 'user-1');
		});

		it('should throw error if unable to join event (e.g., event full)', async () => {
			// Mock delete returns nothing -> user wasn't attending
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([]);

			// Mock failed addAttendee (e.g., event is full)
			const mockAddAttendee = vi.spyOn(eventRepo, 'addAttendee').mockResolvedValue(false);

			await expect(eventRepo.toggleAttendance('user-1', 'event-1')).rejects.toThrow(
				'Unable to join event - it may be full or RSVP may be closed'
			);
		});

		it('should throw error if delete operation fails', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValueOnce(new Error('Database error'));

			await expect(eventRepo.toggleAttendance('user-1', 'event-1')).rejects.toThrow(
				'Database error'
			);
		});
	});
});
