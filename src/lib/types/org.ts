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
	createdAt: Date;
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
