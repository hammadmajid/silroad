/**
 * Represents a user entity.
 *
 * @property id - Unique identifier for the user.
 * @property email - Email address of the user.
 * @property name - Display name of the user.
 * @property image - URL to the user's profile image, or null if not set.
 */
export type User = {
    id: string;
    email: string;
    name: string;
    image: string | null;
};

/**
 * Session data that can be serialized and stored in KV.
 */
export type SerializableSession = {
    userId: string;
    userImage: string | null;
    sessionExpiresAt: string;
};

//-------------------------------------------------------------------//

/**
 * Represents an organization entity with basic information and media assets.
 *
 * @property id - Unique identifier for the organization.
 * @property name - Name of the organization.
 * @property slug - URL-friendly identifier for the organization.
 * @property description - Optional description of the organization.
 * @property avatar - Optional URL to the organization's avatar image.
 * @property backgroundImage - Optional URL to the organization's background image.
 */
export type Organization = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatar: string | null;
    backgroundImage: string | null;
};

/**
 * Data required to create a new organization.
 * @property name - Organization name (required)
 * @property slug - Unique slug identifier (required)
 * @property description - Optional description
 * @property avatar - Optional avatar image URL
 * @property backgroundImage - Optional background image URL
 */
export type OrganizationCreateData = {
    name: string;
    slug: string;
    description?: string;
    avatar?: string;
    backgroundImage?: string;
};

/**
 * Data for updating an organization. All fields optional.
 */
export type OrganizationUpdateData = Partial<OrganizationCreateData>;

/**
 * Represents a member of an organization.
 *
 * @property userId - The unique identifier of the user.
 * @property organizationId - The unique identifier of the organization.
 */
export type OrganizationMember = {
    userId: string;
    organizationId: string;
};

/**
 * Represents an organization with additional statistics.
 *
 * @remarks
 * Extends the {@link Organization} type by including the number of members and events.
 *
 * @property memberCount - The total number of members in the organization.
 * @property eventCount - The total number of events associated with the organization.
 */
export type OrganizationWithStats = Organization & {
    memberCount: number;
    eventCount: number;
};

/**
 * Pagination options for listing organizations.
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

//---------------------------------------------------------------//

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