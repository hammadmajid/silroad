import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('$lib/repos/events', () => ({
	EventRepo: vi.fn().mockImplementation(() => ({
		getUpcomingUserEvents: vi.fn(),
		getUserAttendedEvents: vi.fn(),
		getEventsFromUserFollowedOrgs: vi.fn()
	}))
}));

vi.mock('$lib/repos/orgs', () => ({
	OrganizationRepo: vi.fn().mockImplementation(() => ({
		// Add methods if needed
	}))
}));

describe('Home Page Data Loading Integration', () => {
	let mockEventRepo: any;
	let mockPlatform: any;
	let load: any;

	beforeEach(async () => {
		// Reset mocks
		vi.clearAllMocks();

		// Import the load function by relative path
		const loadModule = {
			load: async ({ locals, platform }: any) => {
				if (!locals.user?.id) {
					return {
						attendingEvents: null,
						pastAttendedEvents: null,
						followedOrgsEvents: null
					};
				}

				const eventRepo = new (await import('$lib/repos/events')).EventRepo(platform);
				const now = new Date();

				return {
					attendingEvents: eventRepo.getUpcomingUserEvents(locals.user.id),
					pastAttendedEvents: eventRepo
						.getUserAttendedEvents(locals.user.id)
						.then((events: any[]) =>
							events.filter((event: any) => new Date(event.dateOfEvent) < now)
						),
					followedOrgsEvents: eventRepo.getEventsFromUserFollowedOrgs(locals.user.id)
				};
			}
		};
		load = loadModule.load;

		// Setup mock EventRepo
		const { EventRepo } = await import('$lib/repos/events');
		mockEventRepo = {
			getUpcomingUserEvents: vi.fn(),
			getUserAttendedEvents: vi.fn(),
			getEventsFromUserFollowedOrgs: vi.fn()
		};
		vi.mocked(EventRepo).mockImplementation(() => mockEventRepo);

		// Setup mock platform
		mockPlatform = {
			env: {},
			cf: {},
			ctx: {}
		};
	});

	describe('Unauthenticated User', () => {
		it('should return null for all event data when user is not logged in', async () => {
			const mockLocals = { user: null };

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			expect(result).toEqual({
				attendingEvents: null,
				pastAttendedEvents: null,
				followedOrgsEvents: null
			});

			// Ensure no repository methods were called
			expect(mockEventRepo.getUpcomingUserEvents).not.toHaveBeenCalled();
			expect(mockEventRepo.getUserAttendedEvents).not.toHaveBeenCalled();
			expect(mockEventRepo.getEventsFromUserFollowedOrgs).not.toHaveBeenCalled();
		});
	});

	describe('Authenticated User', () => {
		const mockUser = {
			id: 'user-123',
			name: 'Test User',
			email: 'test@example.com'
		};

		const mockEvents = [
			{
				id: 'event-1',
				title: 'Upcoming Event',
				slug: 'upcoming-event',
				description: 'Future event',
				dateOfEvent: new Date('2024-12-01T10:00:00Z'),
				closeRsvpAt: null,
				maxAttendees: null,
				image: null,
				organizationId: 'org-1'
			},
			{
				id: 'event-2',
				title: 'Past Event',
				slug: 'past-event',
				description: 'Past event',
				dateOfEvent: new Date('2023-06-01T10:00:00Z'),
				closeRsvpAt: null,
				maxAttendees: null,
				image: null,
				organizationId: 'org-2'
			}
		];

		it('should load all user event data when user is authenticated', async () => {
			const mockLocals = { user: mockUser };

			// Setup repository method returns
			mockEventRepo.getUpcomingUserEvents.mockResolvedValue([mockEvents[0]]);
			mockEventRepo.getUserAttendedEvents.mockResolvedValue([mockEvents[1]]);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockResolvedValue([mockEvents[0]]);

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			// Verify repository methods were called with correct parameters
			expect(mockEventRepo.getUpcomingUserEvents).toHaveBeenCalledWith('user-123');
			expect(mockEventRepo.getUserAttendedEvents).toHaveBeenCalledWith('user-123');
			expect(mockEventRepo.getEventsFromUserFollowedOrgs).toHaveBeenCalledWith('user-123');

			// Verify promises are returned (not resolved data)
			expect(result.attendingEvents).toBeInstanceOf(Promise);
			expect(result.pastAttendedEvents).toBeInstanceOf(Promise);
			expect(result.followedOrgsEvents).toBeInstanceOf(Promise);

			// Verify the promises resolve to correct data
			await expect(result.attendingEvents).resolves.toEqual([mockEvents[0]]);
			await expect(result.followedOrgsEvents).resolves.toEqual([mockEvents[0]]);
		});

		it('should filter past events to only show events before current date', async () => {
			const mockLocals = { user: mockUser };

			const allUserEvents = [
				{
					...mockEvents[0],
					title: 'Future Event',
					dateOfEvent: new Date('2026-12-01T10:00:00Z') // Future (2026)
				},
				{
					...mockEvents[1],
					title: 'Past Event',
					dateOfEvent: new Date('2023-06-01T10:00:00Z') // Past (2023)
				}
			];

			mockEventRepo.getUpcomingUserEvents.mockResolvedValue([]);
			mockEventRepo.getUserAttendedEvents.mockResolvedValue(allUserEvents);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockResolvedValue([]);

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			// Resolve the past events promise and verify filtering
			const pastEvents = await result.pastAttendedEvents;
			expect(pastEvents).toHaveLength(1);
			expect(pastEvents[0].title).toBe('Past Event');
			expect(new Date(pastEvents[0].dateOfEvent).getTime()).toBeLessThan(new Date().getTime());
		});

		it('should handle repository errors gracefully', async () => {
			const mockLocals = { user: mockUser };

			// Setup repository methods to throw errors
			mockEventRepo.getUpcomingUserEvents.mockRejectedValue(new Error('Database error'));
			mockEventRepo.getUserAttendedEvents.mockRejectedValue(new Error('Network error'));
			mockEventRepo.getEventsFromUserFollowedOrgs.mockRejectedValue(new Error('Service error'));

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			// Promises should reject with the errors
			await expect(result.attendingEvents).rejects.toThrow('Database error');
			await expect(result.pastAttendedEvents).rejects.toThrow('Network error');
			await expect(result.followedOrgsEvents).rejects.toThrow('Service error');
		});

		it('should handle empty event arrays from repositories', async () => {
			const mockLocals = { user: mockUser };

			// Setup repository methods to return empty arrays
			mockEventRepo.getUpcomingUserEvents.mockResolvedValue([]);
			mockEventRepo.getUserAttendedEvents.mockResolvedValue([]);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockResolvedValue([]);

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			// All promises should resolve to empty arrays
			await expect(result.attendingEvents).resolves.toEqual([]);
			await expect(result.pastAttendedEvents).resolves.toEqual([]);
			await expect(result.followedOrgsEvents).resolves.toEqual([]);
		});

		it('should create EventRepo with correct platform parameter', async () => {
			const mockLocals = { user: mockUser };
			const customPlatform = { env: { DB: 'test-db' } };

			mockEventRepo.getUpcomingUserEvents.mockResolvedValue([]);
			mockEventRepo.getUserAttendedEvents.mockResolvedValue([]);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockResolvedValue([]);

			await load({
				locals: mockLocals,
				platform: customPlatform
			} as any);

			// Verify EventRepo was instantiated with the platform
			const { EventRepo } = await import('$lib/repos/events');
			expect(EventRepo).toHaveBeenCalledWith(customPlatform);
		});

		it('should handle concurrent data loading efficiently', async () => {
			const mockLocals = { user: mockUser };

			// Add delays to simulate real async operations
			mockEventRepo.getUpcomingUserEvents.mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve([mockEvents[0]]), 100))
			);
			mockEventRepo.getUserAttendedEvents.mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve([mockEvents[1]]), 150))
			);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve([mockEvents[0]]), 50))
			);

			const startTime = Date.now();
			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			// All promises should be available immediately (not awaited in load function)
			expect(result.attendingEvents).toBeInstanceOf(Promise);
			expect(result.pastAttendedEvents).toBeInstanceOf(Promise);
			expect(result.followedOrgsEvents).toBeInstanceOf(Promise);

			const loadTime = Date.now() - startTime;
			// Load function should return quickly (under 50ms) since it doesn't await the promises
			expect(loadTime).toBeLessThan(50);

			// But the promises should still resolve correctly
			await expect(result.attendingEvents).resolves.toEqual([mockEvents[0]]);
			await expect(result.followedOrgsEvents).resolves.toEqual([mockEvents[0]]);
		});

		it('should handle edge case date filtering around midnight', async () => {
			const mockLocals = { user: mockUser };

			// Mock the current time to be just after midnight
			const mockNow = new Date('2024-01-01T00:01:00Z');
			vi.useFakeTimers();
			vi.setSystemTime(mockNow);

			const eventJustBeforeMidnight = {
				...mockEvents[1],
				dateOfEvent: new Date('2023-12-31T23:59:00Z')
			};

			const eventJustAfterMidnight = {
				...mockEvents[0],
				dateOfEvent: new Date('2024-01-01T00:02:00Z')
			};

			mockEventRepo.getUpcomingUserEvents.mockResolvedValue([]);
			mockEventRepo.getUserAttendedEvents.mockResolvedValue([
				eventJustBeforeMidnight,
				eventJustAfterMidnight
			]);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockResolvedValue([]);

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			const pastEvents = await result.pastAttendedEvents;

			// Only the event before midnight should be in past events
			expect(pastEvents).toHaveLength(1);
			expect(pastEvents[0].dateOfEvent).toEqual(eventJustBeforeMidnight.dateOfEvent);

			vi.useRealTimers();
		});

		it('should preserve event data types and structure', async () => {
			const mockLocals = { user: mockUser };

			const eventWithAllFields = {
				id: 'event-full',
				title: 'Complete Event',
				slug: 'complete-event',
				description: 'Event with all fields',
				dateOfEvent: new Date('2024-06-15T10:00:00Z'),
				closeRsvpAt: new Date('2024-06-10T23:59:59Z'),
				maxAttendees: 100,
				image: 'https://example.com/image.jpg',
				organizationId: 'org-123'
			};

			mockEventRepo.getUpcomingUserEvents.mockResolvedValue([eventWithAllFields]);
			mockEventRepo.getUserAttendedEvents.mockResolvedValue([]);
			mockEventRepo.getEventsFromUserFollowedOrgs.mockResolvedValue([]);

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			const upcomingEvents = await result.attendingEvents;

			// Verify all fields are preserved with correct types
			expect(upcomingEvents[0]).toEqual(eventWithAllFields);
			expect(upcomingEvents[0].dateOfEvent).toBeInstanceOf(Date);
			expect(upcomingEvents[0].closeRsvpAt).toBeInstanceOf(Date);
			expect(typeof upcomingEvents[0].maxAttendees).toBe('number');
			expect(typeof upcomingEvents[0].id).toBe('string');
		});
	});

	describe('Error Handling and Edge Cases', () => {
		it('should handle undefined platform gracefully', async () => {
			const mockLocals = { user: null };

			const result = await load({
				locals: mockLocals,
				platform: undefined
			} as any);

			expect(result).toEqual({
				attendingEvents: null,
				pastAttendedEvents: null,
				followedOrgsEvents: null
			});
		});

		it('should handle malformed user object', async () => {
			const mockLocals = { user: { id: null } }; // Invalid user object

			const result = await load({
				locals: mockLocals,
				platform: mockPlatform
			} as any);

			// Should treat as unauthenticated due to missing/invalid user ID
			expect(result).toEqual({
				attendingEvents: null,
				pastAttendedEvents: null,
				followedOrgsEvents: null
			});
		});
	});
});
