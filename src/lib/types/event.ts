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
	createdAt: Date;
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
