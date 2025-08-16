import { getDb, getLogger } from '$lib/db';
import { desc, eq, count } from 'drizzle-orm';
import { events } from '$lib/db/schema';

/**
 * Represents an event entity.
 */
export type Event = {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	dateOfEvent: Date;
	closeRsvpAt: Date | null;
	maxAttendees: number | null;
	image: string | null;
	organizationId: string;
};

/**
 * Data required to create a new event.
 * @property title - Event title (required)
 * @property slug - Unique slug identifier (required)
 * @property description - Optional event description
 * @property dateOfEvent - Event date and time (required)
 * @property closeRsvpAt - Optional RSVP deadline
 * @property maxAttendees - Optional maximum attendee limit
 * @property image - Optional event image URL
 * @property organizationId - Organization hosting the event (required)
 */
export type EventCreateData = {
	title: string;
	slug: string;
	description?: string;
	dateOfEvent: Date;
	closeRsvpAt?: Date;
	maxAttendees?: number;
	image?: string;
	organizationId: string;
};

/**
 * Data for updating an event. All fields optional except organizationId.
 */
export type EventUpdateData = Partial<Omit<EventCreateData, 'organizationId'>>;

/**
 * Represents an event attendee relationship.
 */
export type Attendee = {
	eventId: string;
	userId: string;
};

/**
 * Represents an event organizer relationship.
 */
export type EventOrganizer = {
	eventId: string;
	userId: string;
};

/**
 * Event with aggregated attendee count.
 */
export type EventWithAttendeeCount = Event & {
	attendeeCount: number;
};

/**
 * Pagination options for listing events.
 * @property page - Page number (1-based)
 * @property pageSize - Number of items per page
 */
export type PaginationOptions = {
	page: number;
	pageSize: number;
};

/**
 * Result of a paginated query.
 * @property data - Array of results
 * @property pagination - Pagination metadata
 */
export type PaginationResult<T> = {
	data: T[];
	pagination: {
		page: number;
		pageSize: number;
		totalCount: number;
		totalPages: number;
	};
};

/**
 * Repository for event CRUD operations and queries.
 */
export class EventRepo {
	private db;
	private logger;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.logger = getLogger(platform);
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
			this.logger.writeDataPoint({
				blobs: ['error', 'EventRepo', 'create', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
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
			this.logger.writeDataPoint({
				blobs: ['error', 'EventRepo', 'getById', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
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
			this.logger.writeDataPoint({
				blobs: ['error', 'EventRepo', 'getBySlug', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
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
			this.logger.writeDataPoint({
				blobs: ['error', 'EventRepo', 'update', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
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
			this.logger.writeDataPoint({
				blobs: ['error', 'EventRepo', 'delete', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
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
			this.logger.writeDataPoint({
				blobs: ['error', 'EventRepo', 'getAll', JSON.stringify(error)],
				doubles: [1],
				indexes: [crypto.randomUUID()]
			});
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
	 * @param _eventId - Event UUID
	 * @param _userId - User UUID to add as attendee
	 * @returns true if attendee was added successfully, false otherwise
	 */
	async addAttendee(_eventId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	/**
	 * Removes a user from event attendance.
	 * @param _eventId - Event UUID
	 * @param _userId - User UUID to remove from attendance
	 * @returns true if attendee was removed successfully, false otherwise
	 */
	async removeAttendee(_eventId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets all attendee user IDs for an event.
	 * @param _eventId - Event UUID
	 * @returns Array of user IDs who are attending, empty array if none or on error
	 */
	async getAttendees(_eventId: string): Promise<string[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets all events that a user has attended (past events).
	 * @param _userId - User UUID
	 * @returns Array of events the user attended, empty array if none or on error
	 */
	async getUserAttendedEvents(_userId: string): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets all upcoming events that a user is attending.
	 * @param _userId - User UUID
	 * @returns Array of upcoming events the user is attending, empty array if none or on error
	 */
	async getUpcomingUserEvents(_userId: string): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Checks if a user is attending an event.
	 * @param _eventId - Event UUID
	 * @param _userId - User UUID to check attendance for
	 * @returns true if user is attending, false otherwise or on error
	 */
	async isAttending(_eventId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	// Organizer Management
	/**
	 * Adds a user as an organizer to an event.
	 * @param _eventId - Event UUID
	 * @param _userId - User UUID to add as organizer
	 * @returns true if organizer was added successfully, false otherwise
	 */
	async addOrganizer(_eventId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	/**
	 * Removes a user from event organization.
	 * @param _eventId - Event UUID
	 * @param _userId - User UUID to remove from organization
	 * @returns true if organizer was removed successfully, false otherwise
	 */
	async removeOrganizer(_eventId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets all organizer user IDs for an event.
	 * @param _eventId - Event UUID
	 * @returns Array of user IDs who are organizers, empty array if none or on error
	 */
	async getOrganizers(_eventId: string): Promise<string[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets all events that a user has organized.
	 * @param _userId - User UUID
	 * @returns Array of events the user organized, empty array if none or on error
	 */
	async getUserOrganizedEvents(_userId: string): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Checks if a user is an organizer of an event.
	 * @param _eventId - Event UUID
	 * @param _userId - User UUID to check organizer status for
	 * @returns true if user is an organizer, false otherwise or on error
	 */
	async isOrganizer(_eventId: string, _userId: string): Promise<boolean> {
		throw new Error('Not implemented');
	}

	// Query Methods
	/**
	 * Gets upcoming events ordered by date.
	 * @param _limit - Optional limit on number of events to return
	 * @returns Array of upcoming events, empty array if none or on error
	 */
	async getUpcomingEvents(_limit?: number): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets all events for a specific organization.
	 * @param _organizationId - Organization UUID
	 * @returns Array of events for the organization, empty array if none or on error
	 */
	async getEventsByOrganization(_organizationId: string): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets upcoming events for a specific organization.
	 * @param _organizationId - Organization UUID
	 * @returns Array of upcoming events for the organization, empty array if none or on error
	 */
	async getUpcomingEventsByOrganization(_organizationId: string): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Searches events by title and description using case-insensitive matching.
	 * @param _query - Search query string
	 * @param _filters - Optional filters for the search
	 * @returns Array of matching events, empty array if none found or error
	 */
	async searchEvents(_query: string, _filters?: { organizationId?: string }): Promise<Event[]> {
		throw new Error('Not implemented');
	}

	/**
	 * Gets an event with aggregated attendee count.
	 * @param _eventId - Event UUID
	 * @returns Event with attendee count, or null if not found or error
	 */
	async getEventWithAttendeeCount(_eventId: string): Promise<EventWithAttendeeCount | null> {
		throw new Error('Not implemented');
	}
}
