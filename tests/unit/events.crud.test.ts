import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	EventRepo,
	type Event,
	type EventCreateData,
	type EventUpdateData,
	type PaginationOptions
} from '$lib/repos/events';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('EventRepo - CRUD Operations', () => {
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
		image: 'https://example.com/event.jpg',
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
			update: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			count: vi.fn(),
			offset: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis()
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

	describe('create', () => {
		it('should create and return new event with all fields', async () => {
			const createData: EventCreateData = {
				title: 'Test Event',
				slug: 'test-event',
				description: 'A test event for testing',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				closeRsvpAt: new Date('2024-11-30T18:00:00.000Z'),
				maxAttendees: 100,
				image: 'https://example.com/event.jpg',
				organizationId: 'org-1'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([mockEvent]);

			const result = await eventRepo.create(createData);

			expect(result).toEqual(mockEvent);
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Test Event',
					slug: 'test-event',
					organizationId: 'org-1'
				})
			);
		});

		it('should create event with minimal data', async () => {
			const createData: EventCreateData = {
				title: 'Minimal Event',
				slug: 'minimal-event',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				organizationId: 'org-1'
			};

			const minimalEvent = {
				id: 'event-2',
				title: 'Minimal Event',
				slug: 'minimal-event',
				description: null,
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				closeRsvpAt: null,
				maxAttendees: null,
				image: null,
				organizationId: 'org-1'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([minimalEvent]);

			const result = await eventRepo.create(createData);

			expect(result).toEqual(minimalEvent);
		});

		it('should generate UUID for id field', async () => {
			const createData: EventCreateData = {
				title: 'Test Event',
				slug: 'test-event',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				organizationId: 'org-1'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([mockEvent]);

			await eventRepo.create(createData);

			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					id: expect.stringMatching(
						/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
					)
				})
			);
		});

		it('should return null on database error', async () => {
			const createData: EventCreateData = {
				title: 'Test Event',
				slug: 'test-event',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				organizationId: 'org-1'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.create(createData);

			expect(result).toBeNull();
		});

		it('should handle slug uniqueness constraint violation', async () => {
			const createData: EventCreateData = {
				title: 'Test Event',
				slug: 'existing-slug',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				organizationId: 'org-1'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('UNIQUE constraint failed: events.slug'));

			const result = await eventRepo.create(createData);

			expect(result).toBeNull();
		});

		it('should validate organization exists', async () => {
			const createData: EventCreateData = {
				title: 'Test Event',
				slug: 'test-event',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				organizationId: 'nonexistent-org'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('FOREIGN KEY constraint failed'));

			const result = await eventRepo.create(createData);

			expect(result).toBeNull();
		});

		it('should validate dateOfEvent is in the future', async () => {
			const pastDate = new Date('2020-01-01T18:00:00.000Z');
			const createData: EventCreateData = {
				title: 'Past Event',
				slug: 'past-event',
				dateOfEvent: pastDate,
				organizationId: 'org-1'
			};

			const result = await eventRepo.create(createData);

			expect(result).toBeNull();
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it('should validate closeRsvpAt is before dateOfEvent', async () => {
			const eventDate = new Date('2024-12-01T18:00:00.000Z');
			const closeRsvpDate = new Date('2024-12-02T18:00:00.000Z'); // After event date

			const createData: EventCreateData = {
				title: 'Invalid Event',
				slug: 'invalid-event',
				dateOfEvent: eventDate,
				closeRsvpAt: closeRsvpDate,
				organizationId: 'org-1'
			};

			const result = await eventRepo.create(createData);

			expect(result).toBeNull();
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it('should validate maxAttendees is positive', async () => {
			const createData: EventCreateData = {
				title: 'Invalid Event',
				slug: 'invalid-event',
				dateOfEvent: new Date('2024-12-01T18:00:00.000Z'),
				maxAttendees: -10,
				organizationId: 'org-1'
			};

			const result = await eventRepo.create(createData);

			expect(result).toBeNull();
			expect(mockDb.insert).not.toHaveBeenCalled();
		});
	});

	describe('getById', () => {
		it('should return event when found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockEvent]);

			const result = await eventRepo.getById('event-1');

			expect(result).toEqual(mockEvent);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(events.id, 'event-1')
		});

		it('should return null when event not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.getById('nonexistent');

			expect(result).toBeNull();
		});

		it('should return null on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getById('event-1');

			expect(result).toBeNull();
		});

		it('should validate UUID format', async () => {
			const result = await eventRepo.getById('invalid-uuid');

			expect(result).toBeNull();
			expect(mockDb.select).not.toHaveBeenCalled();
		});
	});

	describe('getBySlug', () => {
		it('should return event when found by slug', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockEvent]);

			const result = await eventRepo.getBySlug('test-event');

			expect(result).toEqual(mockEvent);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(events.slug, 'test-event')
		});

		it('should return null when event slug not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.getBySlug('nonexistent-slug');

			expect(result).toBeNull();
		});

		it('should handle case sensitivity in slug search', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await eventRepo.getBySlug('TEST-EVENT');

			expect(result).toBeNull();
		});

		it('should return null on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getBySlug('test-event');

			expect(result).toBeNull();
		});
	});

	describe('update', () => {
		it('should update and return event', async () => {
			const updateData: EventUpdateData = {
				title: 'Updated Event',
				description: 'Updated description'
			};

			const updatedEvent = { ...mockEvent, ...updateData };

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([updatedEvent]);

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toEqual(updatedEvent);
			expect(mockDb.set).toHaveBeenCalledWith(updateData);
		});

		it('should return null when event not found', async () => {
			const updateData: EventUpdateData = {
				title: 'Updated Event'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([]);

			const result = await eventRepo.update('nonexistent', updateData);

			expect(result).toBeNull();
		});

		it('should handle partial updates', async () => {
			const updateData: EventUpdateData = {
				description: 'Only description updated'
			};

			const updatedEvent = { ...mockEvent, description: 'Only description updated' };

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([updatedEvent]);

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toEqual(updatedEvent);
		});

		it('should not allow updating organizationId', async () => {
			const updateData = {
				organizationId: 'new-org',
				title: 'Updated Event'
			} as any;

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([mockEvent]);

			await eventRepo.update('event-1', updateData);

			expect(mockDb.set).toHaveBeenCalledWith(
				expect.not.objectContaining({ organizationId: 'new-org' })
			);
		});

		it('should validate dateOfEvent is in the future when updated', async () => {
			const pastDate = new Date('2020-01-01T18:00:00.000Z');
			const updateData: EventUpdateData = {
				dateOfEvent: pastDate
			};

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toBeNull();
			expect(mockDb.update).not.toHaveBeenCalled();
		});

		it('should validate closeRsvpAt is before dateOfEvent when updated', async () => {
			const eventDate = new Date('2024-12-01T18:00:00.000Z');
			const closeRsvpDate = new Date('2024-12-02T18:00:00.000Z');

			const updateData: EventUpdateData = {
				dateOfEvent: eventDate,
				closeRsvpAt: closeRsvpDate
			};

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toBeNull();
			expect(mockDb.update).not.toHaveBeenCalled();
		});

		it('should validate maxAttendees is positive when updated', async () => {
			const updateData: EventUpdateData = {
				maxAttendees: -5
			};

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toBeNull();
			expect(mockDb.update).not.toHaveBeenCalled();
		});

		it('should handle slug uniqueness constraint violation on update', async () => {
			const updateData: EventUpdateData = {
				slug: 'existing-slug'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('UNIQUE constraint failed: events.slug'));

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toBeNull();
		});

		it('should return null on database error', async () => {
			const updateData: EventUpdateData = {
				title: 'Updated Event'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.update('event-1', updateData);

			expect(result).toBeNull();
		});
	});

	describe('delete', () => {
		it('should delete event successfully', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue({ changes: 1 });

			await eventRepo.delete('event-1');

			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it('should not throw error when deleting non-existent event', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue({ changes: 0 });

			await expect(eventRepo.delete('nonexistent')).resolves.not.toThrow();
		});

		it('should handle database error gracefully', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			await expect(eventRepo.delete('event-1')).resolves.not.toThrow();
		});

		it('should handle foreign key constraint violations from attendees', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('FOREIGN KEY constraint failed'));

			await expect(eventRepo.delete('event-1')).resolves.not.toThrow();
		});

		it('should validate UUID format', async () => {
			await expect(eventRepo.delete('invalid-uuid')).resolves.not.toThrow();
			expect(mockDb.delete).not.toHaveBeenCalled();
		});
	});

	describe('getAll', () => {
		it('should return paginated events with default pagination', async () => {
			const mockEvents = [mockEvent, { ...mockEvent, id: 'event-2', title: 'Second Event' }];
			const totalCount = 2;

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockResolvedValue(mockEvents);

			mockDb.count.mockResolvedValue([{ count: totalCount }]);

			const result = await eventRepo.getAll();

			expect(result).toEqual({
				data: mockEvents,
				pagination: {
					page: 1,
					pageSize: 10,
					totalCount: 2,
					totalPages: 1
				}
			});
		});

		it('should return paginated events with custom pagination', async () => {
			const mockEvents = [mockEvent];
			const totalCount = 15;
			const pagination: PaginationOptions = { page: 2, pageSize: 5 };

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockResolvedValue(mockEvents);

			mockDb.count.mockResolvedValue([{ count: totalCount }]);

			const result = await eventRepo.getAll(pagination);

			expect(result).toEqual({
				data: mockEvents,
				pagination: {
					page: 2,
					pageSize: 5,
					totalCount: 15,
					totalPages: 3
				}
			});
			expect(mockDb.limit).toHaveBeenCalledWith(5);
			expect(mockDb.offset).toHaveBeenCalledWith(5); // (page - 1) * pageSize
		});

		it('should handle empty results', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockResolvedValue([]);

			mockDb.count.mockResolvedValue([{ count: 0 }]);

			const result = await eventRepo.getAll();

			expect(result).toEqual({
				data: [],
				pagination: {
					page: 1,
					pageSize: 10,
					totalCount: 0,
					totalPages: 0
				}
			});
		});

		it('should sort events by date descending by default', async () => {
			const mockEvents = [mockEvent];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockResolvedValue(mockEvents);

			mockDb.count.mockResolvedValue([{ count: 1 }]);

			await eventRepo.getAll();

			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should return empty result on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockRejectedValue(new Error('Database error'));

			const result = await eventRepo.getAll();

			expect(result).toEqual({
				data: [],
				pagination: {
					page: 1,
					pageSize: 10,
					totalCount: 0,
					totalPages: 0
				}
			});
		});
	});
});
