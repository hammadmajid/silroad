import { getDb } from '$lib/db';
import { desc, eq, count, gt, like, or, and, asc } from 'drizzle-orm';
import {
	events,
	attendees,
	eventOrganizers,
	organizationMembers,
	users,
	organizationFollowers
} from '$lib/db/schema';
import { Logger } from '$lib/utils/logger';
import type {
	Event,
	EventCreateData,
	EventUpdateData,
	EventWithAttendeeCount,
	PaginationOptions,
	PaginationResult,
	User
} from '$lib/types';

/**
 * Repository for event CRUD operations and queries.
 */
export class EventRepo {
	private db;
	private logger;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.logger = new Logger(platform);
	}

	// Core CRUD Operations
	/**
	 * Creates a new event.
	 * @param eventData - Event creation data
	 * @returns The created event, or null on error
	 */
	async create(eventData: EventCreateData): Promise<Event | null> {
		try {
			const result = await this.db
				.insert(events)
				.values({
					title: eventData.title,
					slug: eventData.slug,
					description: eventData.description ?? null,
					dateOfEvent: eventData.dateOfEvent,
					closeRsvpAt: eventData.closeRsvpAt ?? null,
					maxAttendees: eventData.maxAttendees ?? null,
					image: eventData.image ?? null,
					organizationId: eventData.organizationId
				})
				.returning();

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('EventRepo', 'create', error);
			return null;
		}
	}

	/**
	 * Gets an event by its UUID.
	 * @param id - Event UUID
	 * @returns The event, or null if not found or error
	 */
	async getById(id: string): Promise<Event | null> {
		try {
			const result = await this.db.select().from(events).where(eq(events.id, id)).limit(1);

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('EventRepo', 'getById', error);
			return null;
		}
	}

	/**
	 * Gets an event by its slug.
	 * @param slug - Event slug
	 * @returns The event, or null if not found or error
	 */
	async getBySlug(slug: string): Promise<Event | null> {
		try {
			const result = await this.db.select().from(events).where(eq(events.slug, slug)).limit(1);

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('EventRepo', 'getBySlug', error);
			return null;
		}
	}

	/**
	 * Updates an event.
	 * @param id - Event UUID
	 * @param eventData - Partial update data
	 * @returns The updated event, or null if not found or error
	 */
	async update(id: string, eventData: EventUpdateData): Promise<Event | null> {
		try {
			const result = await this.db
				.update(events)
				.set(eventData)
				.where(eq(events.id, id))
				.returning();

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('EventRepo', 'update', error);
			return null;
		}
	}

	/**
	 * Deletes an event by its UUID.
	 * @param id - Event UUID
	 */
	async delete(id: string): Promise<void | Error> {
		try {
			await this.db.delete(events).where(eq(events.id, id));
		} catch (error) {
			this.logger.error('EventRepo', 'delete', error);
			return error as Error;
		}
	}

	/**
	 * Gets a paginated list of events.
	 * @param pagination - Optional pagination options
	 * @returns Paginated result of events
	 */
	async getAll(pagination?: PaginationOptions): Promise<PaginationResult<Event>> {
		try {
			const page = pagination?.page ?? 1;
			const pageSize = pagination?.pageSize ?? 10;
			const offset = (page - 1) * pageSize;

			// Get total count
			const totalCountResult = await this.db.select({ count: count() }).from(events);
			const totalCount = totalCountResult[0]?.count ?? 0;
			const totalPages = Math.ceil(totalCount / pageSize);

			// Get paginated events
			const eventsData = await this.db
				.select()
				.from(events)
				.orderBy(desc(events.dateOfEvent))
				.limit(pageSize)
				.offset(offset);

			return {
				data: eventsData,
				pagination: {
					page,
					pageSize,
					totalCount,
					totalPages
				}
			};
		} catch (error) {
			this.logger.error('EventRepo', 'getAll', error);
			return {
				data: [],
				pagination: {
					page: 1,
					pageSize: 10,
					totalCount: 0,
					totalPages: 0
				}
			};
		}
	}

	// Attendee Management
	/**
	 * Adds a user as an attendee to an event.
	 * @param eventId - Event UUID
	 * @param userId - User UUID to add as attendee
	 * @returns true if attendee was added successfully, false otherwise
	 */
	async addAttendee(eventId: string, userId: string): Promise<boolean> {
		try {
			// 1. Check if event exists and get event details
			const event = await this.getById(eventId);
			if (!event) {
				return false;
			}

			// 2. Check if RSVP is still open
			if (event.closeRsvpAt && new Date() > event.closeRsvpAt) {
				return false;
			}

			// 3. Check capacity if maxAttendees is set
			if (event.maxAttendees !== null) {
				const attendeeCountResult = await this.db
					.select({ count: count() })
					.from(attendees)
					.where(eq(attendees.eventId, eventId));

				const currentCount = attendeeCountResult[0]?.count ?? 0;
				if (currentCount >= event.maxAttendees) {
					return false;
				}
			}

			// 4. Try to insert attendee
			await this.db.insert(attendees).values({ eventId, userId }).returning();

			return true;
		} catch (error) {
			this.logger.error('EventRepo', 'addAttendee', error);
			return false;
		}
	}

	/**
	 * Removes a user from event attendance.
	 * @param eventId - Event UUID
	 * @param userId - User UUID to remove from attendance
	 * @returns true if attendee was removed successfully, false otherwise
	 */
	async removeAttendee(eventId: string, userId: string): Promise<boolean> {
		try {
			await this.db
				.delete(attendees)
				.where(and(eq(attendees.eventId, eventId), eq(attendees.userId, userId)));

			return true;
		} catch (error) {
			this.logger.error('EventRepo', 'removeAttendee', error);
			return false;
		}
	}

	/**
	 * Gets all attendees for an event.
	 * @param eventId - Event UUID
	 * @returns Array of user objects who are attending, empty array if none or on error
	 */
	async getAttendees(eventId: string): Promise<User[]> {
		try {
			const result = await this.db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image
				})
				.from(attendees)
				.innerJoin(users, eq(attendees.userId, users.id))
				.where(eq(attendees.eventId, eventId))
				.orderBy(users.name);

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getAttendees', error);
			return [];
		}
	}

	/**
	 * Gets all events that a user has attended (past events).
	 * @param userId - User UUID
	 * @returns Array of events the user attended, empty array if none or on error
	 */
	async getUserAttendedEvents(userId: string): Promise<Event[]> {
		try {
			const result = await this.db
				.select({
					id: events.id,
					title: events.title,
					slug: events.slug,
					description: events.description,
					dateOfEvent: events.dateOfEvent,
					closeRsvpAt: events.closeRsvpAt,
					maxAttendees: events.maxAttendees,
					image: events.image,
					organizationId: events.organizationId
				})
				.from(events)
				.innerJoin(attendees, eq(events.id, attendees.eventId))
				.where(eq(attendees.userId, userId))
				// TODO: fix filter past events
				.orderBy(desc(events.dateOfEvent));

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getUserAttendedEvents', error);
			return [];
		}
	}

	/**
	 * Gets all upcoming events that a user is attending.
	 * @param userId - User UUID
	 * @returns Array of upcoming events the user is attending, empty array if none or on error
	 */
	async getUpcomingUserEvents(userId: string): Promise<Event[]> {
		try {
			const now = new Date();
			const result = await this.db
				.select({
					id: events.id,
					title: events.title,
					slug: events.slug,
					description: events.description,
					dateOfEvent: events.dateOfEvent,
					closeRsvpAt: events.closeRsvpAt,
					maxAttendees: events.maxAttendees,
					image: events.image,
					organizationId: events.organizationId
				})
				.from(events)
				.innerJoin(attendees, eq(events.id, attendees.eventId))
				.where(and(eq(attendees.userId, userId), gt(events.dateOfEvent, now)))
				.orderBy(asc(events.dateOfEvent));

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getUpcomingUserEvents', error);
			return [];
		}
	}

	/**
	 * Checks if a user is attending an event.
	 * @param eventId - Event UUID
	 * @param userId - User UUID to check attendance for
	 * @returns true if user is attending, false otherwise or on error
	 */
	async isAttending(eventId: string, userId: string): Promise<boolean> {
		try {
			const result = await this.db
				.select({ userId: attendees.userId })
				.from(attendees)
				.where(and(eq(attendees.eventId, eventId), eq(attendees.userId, userId)))
				.limit(1);

			return result.length > 0;
		} catch (error) {
			this.logger.error('EventRepo', 'isAttending', error);
			return false;
		}
	}

	/**
	 * Toggles the attendance status for a user on an event.
	 * If the user is already attending, removes them from the event.
	 * If the user is not attending, adds them to the event.
	 * @param userId - User UUID who is toggling attendance
	 * @param eventId - Event UUID to join/leave
	 * @returns 'joined' | 'left' on success, null on error
	 */
	async toggleAttendance(userId: string, eventId: string): Promise<'joined' | 'left' | null> {
		try {
			// Try removing first and check if something was removed
			const removed = await this.db
				.delete(attendees)
				.where(and(eq(attendees.eventId, eventId), eq(attendees.userId, userId)))
				.returning({ id: attendees.eventId });

			if (removed.length > 0) {
				return 'left';
			}

			// If nothing removed, try to add attendee
			const added = await this.addAttendee(eventId, userId);
			if (added) {
				return 'joined';
			}

			// If addAttendee failed (e.g., event full, RSVP closed), log and return null
			this.logger.error(
				'EventRepo',
				'toggleAttendance',
				'Unable to join event - it may be full or RSVP may be closed'
			);
			return null;
		} catch (error) {
			this.logger.error('EventRepo', 'toggleAttendance', error);
			return null;
		}
	}

	// Organizer Management
	/**
	 * Adds a user as an organizer to an event.
	 * @param eventId - Event UUID
	 * @param userId - User UUID to add as organizer
	 * @returns true if organizer was added successfully, false otherwise
	 */
	async addOrganizer(eventId: string, userId: string): Promise<boolean> {
		try {
			// 1. Check if event exists
			const event = await this.getById(eventId);
			if (!event) {
				return false;
			}

			// 2. Try to insert organizer
			await this.db.insert(eventOrganizers).values({ eventId, userId }).returning();

			return true;
		} catch (error) {
			this.logger.error('EventRepo', 'addOrganizer', error);
			return false;
		}
	}

	/**
	 * Removes a user from event organization.
	 * @param eventId - Event UUID
	 * @param userId - User UUID to remove from organization
	 * @returns true if organizer was removed successfully, false otherwise
	 */
	async removeOrganizer(eventId: string, userId: string): Promise<boolean> {
		try {
			// 1. Check current organizer count
			const organizerCountResult = await this.db
				.select({ count: count() })
				.from(eventOrganizers)
				.where(eq(eventOrganizers.eventId, eventId));

			const organizerCount = organizerCountResult[0]?.count ?? 0;

			// 2. Prevent removing the last organizer
			if (organizerCount <= 1) {
				return false;
			}

			// 3. Remove the organizer
			await this.db
				.delete(eventOrganizers)
				.where(and(eq(eventOrganizers.eventId, eventId), eq(eventOrganizers.userId, userId)));

			return true;
		} catch (error) {
			this.logger.error('EventRepo', 'removeOrganizer', error);
			return false;
		}
	}

	/**
	 * Gets all organizer for an event.
	 * @param eventId - Event UUID
	 * @returns Array of user objects who are organizers, empty array if none or on error
	 */
	async getOrganizers(eventId: string): Promise<User[]> {
		try {
			const result = await this.db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image
				})
				.from(eventOrganizers)
				.innerJoin(users, eq(eventOrganizers.userId, users.id))
				.where(eq(eventOrganizers.eventId, eventId))
				.orderBy(users.name);

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getOrganizers', error);
			return [];
		}
	}

	/**
	 * Gets all events that a user has organized.
	 * @param userId - User UUID
	 * @returns Array of events the user organized, empty array if none or on error
	 */
	async getUserOrganizedEvents(userId: string): Promise<Event[]> {
		try {
			const result = await this.db
				.select({
					id: events.id,
					title: events.title,
					slug: events.slug,
					description: events.description,
					dateOfEvent: events.dateOfEvent,
					closeRsvpAt: events.closeRsvpAt,
					maxAttendees: events.maxAttendees,
					image: events.image,
					organizationId: events.organizationId
				})
				.from(events)
				.innerJoin(eventOrganizers, eq(events.id, eventOrganizers.eventId))
				.where(eq(eventOrganizers.userId, userId))
				.orderBy(desc(events.dateOfEvent));

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getUserOrganizedEvents', error);
			return [];
		}
	}

	/**
	 * Checks if a user is an organizer of an event.
	 * @param eventId - Event UUID
	 * @param userId - User UUID to check organizer status for
	 * @returns true if user is an organizer, false otherwise or on error
	 */
	async isOrganizer(eventId: string, userId: string): Promise<boolean> {
		try {
			// 1. Check if user is explicit organizer
			const organizerResult = await this.db
				.select({ userId: eventOrganizers.userId })
				.from(eventOrganizers)
				.where(and(eq(eventOrganizers.eventId, eventId), eq(eventOrganizers.userId, userId)))
				.limit(1);

			if (organizerResult.length > 0) {
				return true;
			}

			// 2. Check if user is member of event organization (implicit organizer access)
			const event = await this.getById(eventId);
			if (!event) {
				return false;
			}

			const memberResult = await this.db
				.select({ userId: organizationMembers.userId })
				.from(organizationMembers)
				.where(
					and(
						eq(organizationMembers.organizationId, event.organizationId),
						eq(organizationMembers.userId, userId)
					)
				)
				.limit(1);

			return memberResult.length > 0;
		} catch (error) {
			this.logger.error('EventRepo', 'isOrganizer', error);
			return false;
		}
	}

	// Query Methods
	/**
	 * Gets upcoming events ordered by date.
	 * @param limit - Optional limit on number of events to return
	 * @returns Array of upcoming events, empty array if none or on error
	 */
	async getUpcomingEvents(limit?: number): Promise<Event[]> {
		try {
			const now = new Date();
			const queryLimit = limit ?? 10;

			const result = await this.db
				.select()
				.from(events)
				.where(gt(events.dateOfEvent, now))
				.orderBy(asc(events.dateOfEvent))
				.limit(queryLimit);

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getUpcomingEvents', error);
			return [];
		}
	}

	/**
	 * Gets all events for a specific organization.
	 * @param organizationId - Organization UUID
	 * @returns Array of events for the organization, empty array if none or on error
	 */
	async getEventsByOrganization(organizationId: string): Promise<Event[]> {
		try {
			const result = await this.db
				.select()
				.from(events)
				.where(eq(events.organizationId, organizationId))
				.orderBy(desc(events.dateOfEvent));

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getEventsByOrganization', error);
			return [];
		}
	}

	/**
	 * Gets upcoming events for a specific organization.
	 * @param organizationId - Organization UUID
	 * @returns Array of upcoming events for the organization, empty array if none or on error
	 */
	async getUpcomingEventsByOrganization(organizationId: string): Promise<Event[]> {
		try {
			const now = new Date();

			const result = await this.db
				.select()
				.from(events)
				.where(and(eq(events.organizationId, organizationId), gt(events.dateOfEvent, now)))
				.orderBy(asc(events.dateOfEvent));

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getUpcomingEventsByOrganization', error);
			return [];
		}
	}

	/**
	 * Get events from organizations user is following
	 * @param userId The id of the user
	 * @returns Array of Events
	 */
	async getEventsFromUserFollowedOrgs(userId: string): Promise<Event[]> {
		try {
			const result = await this.db
				.select({
					id: events.id,
					title: events.title,
					slug: events.slug,
					description: events.description,
					dateOfEvent: events.dateOfEvent,
					closeRsvpAt: events.closeRsvpAt,
					maxAttendees: events.maxAttendees,
					image: events.image,
					organizationId: events.organizationId
				})
				.from(events)
				.innerJoin(
					organizationFollowers,
					eq(events.organizationId, organizationFollowers.organizationId)
				)
				.where(eq(organizationFollowers.userId, userId))
				.orderBy(desc(events.dateOfEvent));

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'getEventsFromUserFollowedOrgs', error);
			return [];
		}
	}

	/**
	 * Searches events by title and description using case-insensitive matching.
	 * @param query - Search query string
	 * @param filters - Optional filters for the search
	 * @returns Array of matching events, empty array if none found or error
	 */
	async searchEvents(query: string, filters?: { organizationId?: string }): Promise<Event[]> {
		try {
			const searchPattern = `%${query}%`;

			let whereCondition = or(
				like(events.title, searchPattern),
				like(events.description, searchPattern)
			);

			if (filters?.organizationId) {
				whereCondition = and(whereCondition, eq(events.organizationId, filters.organizationId));
			}

			const result = await this.db
				.select()
				.from(events)
				.where(whereCondition)
				.orderBy(desc(events.dateOfEvent))
				.limit(20);

			return result;
		} catch (error) {
			this.logger.error('EventRepo', 'searchEvents', error);
			return [];
		}
	}

	/**
	 * Gets an event with aggregated attendee count.
	 * @param eventId - Event UUID
	 * @returns Event with attendee count, or null if not found or error
	 */
	async getEventWithAttendeeCount(eventId: string): Promise<EventWithAttendeeCount | null> {
		try {
			const result = await this.db
				.select({
					id: events.id,
					title: events.title,
					slug: events.slug,
					description: events.description,
					dateOfEvent: events.dateOfEvent,
					closeRsvpAt: events.closeRsvpAt,
					maxAttendees: events.maxAttendees,
					image: events.image,
					organizationId: events.organizationId,
					attendeeCount: count(attendees.userId)
				})
				.from(events)
				.leftJoin(attendees, eq(events.id, attendees.eventId))
				.where(eq(events.id, eventId))
				.groupBy(events.id);

			return result[0] ?? null;
		} catch (error) {
			this.logger.error('EventRepo', 'getEventWithAttendeeCount', error);
			return null;
		}
	}
}
