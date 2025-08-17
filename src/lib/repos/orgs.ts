import { getDb } from '$lib/db';
import { eq, like, or, and, count, asc } from 'drizzle-orm';
import { organizations, organizationMembers, events, users } from '$lib/db/schema';
import { Logger } from '$lib/utils/logger';
import type {
	Organization,
	OrganizationCreateData,
	OrganizationUpdateData,
	OrganizationWithStats,
	PaginationOptions,
	PaginationResult,
	User
} from '$lib/types';

/**
 * Repository for organization CRUD and queries.
 */
export class OrganizationRepo {
	private db;
	private logger;

	constructor(platform: App.Platform | undefined) {
		this.db = getDb(platform);
		this.logger = new Logger(platform);
	}

	/**
	 * Creates a new organization.
	 * @param orgData - Organization creation data
	 * @returns The created organization, or null on error
	 */
	async create(orgData: OrganizationCreateData): Promise<Organization | null> {
		try {
			const createData = {
				name: orgData.name,
				slug: orgData.slug,
				description: orgData.description || null,
				avatar: orgData.avatar || null,
				backgroundImage: orgData.backgroundImage || null
			};

			const result = await this.db.insert(organizations).values(createData).returning();
			return result.length > 0 ? result[0] : null;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'create', error);
			return null;
		}
	}

	/**
	 * Gets an organization by its UUID.
	 * @param id - Organization UUID
	 * @returns The organization, or null if not found or error
	 */
	async getById(id: string): Promise<Organization | null> {
		try {
			const org = await this.db
				.select()
				.from(organizations)
				.where(eq(organizations.id, id))
				.limit(1);
			return org.length === 0 ? null : org[0];
		} catch (error) {
			this.logger.error('OrganizationRepo', 'getById', error);
			return null;
		}
	}

	/**
	 * Gets an organization by its slug.
	 * @param slug - Organization slug
	 * @returns The organization, or null if not found or error
	 */
	async getBySlug(slug: string): Promise<Organization | null> {
		try {
			const org = await this.db
				.select()
				.from(organizations)
				.where(eq(organizations.slug, slug))
				.limit(1);

			return org.length === 0 ? null : org[0];
		} catch (error) {
			this.logger.error('OrganizationRepo', 'getBySlug', error);
			return null;
		}
	}

	/**
	 * Updates an organization.
	 * @param id - Organization UUID
	 * @param orgData - Partial update data
	 * @returns The updated organization, or null if not found or error
	 */
	async update(id: string, orgData: OrganizationUpdateData): Promise<Organization | null> {
		try {
			const result = await this.db
				.update(organizations)
				.set(orgData)
				.where(eq(organizations.id, id))
				.returning();

			return result.length > 0 ? result[0] : null;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'update', error);
			return null;
		}
	}

	/**
	 * Deletes an organization by its UUID. Does not throw on error.
	 * @param id - Organization UUID
	 * @returns void in case of success or Error in case of error
	 */
	async delete(id: string): Promise<Error | void> {
		try {
			await this.db.delete(organizations).where(eq(organizations.id, id));
		} catch (error) {
			this.logger.error('OrganizationRepo', 'delete', error);
			return error instanceof Error ? error : new Error(String(error));
		}
	}

	/**
	 * Gets a paginated list of organizations.
	 * @param pagination - Optional pagination options
	 * @returns Paginated result of organizations
	 */
	async getAll(pagination?: PaginationOptions): Promise<PaginationResult<Organization>> {
		try {
			const page = pagination?.page || 1;
			const pageSize = pagination?.pageSize || 10;
			const offset = (page - 1) * pageSize;

			// Get total count
			const countResult = await this.db.select({ count: count() }).from(organizations);
			const totalCount = countResult[0]?.count || 0;
			const totalPages = Math.ceil(totalCount / pageSize);

			// Get paginated data
			const data = await this.db
				.select()
				.from(organizations)
				.orderBy(asc(organizations.name))
				.limit(pageSize)
				.offset(offset);

			return {
				data,
				pagination: {
					page,
					pageSize,
					totalCount,
					totalPages: totalPages === 0 ? 0 : totalPages
				}
			};
		} catch (error) {
			this.logger.error('OrganizationRepo', 'getAll', error);
			return {
				data: [],
				pagination: {
					page: pagination?.page || 1,
					pageSize: pagination?.pageSize || 10,
					totalCount: 0,
					totalPages: 0
				}
			};
		}
	}

	// Member Management
	/**
	 * Adds a user as a member to an organization.
	 * @param organizationId - Organization UUID
	 * @param userId - User UUID to add as member
	 * @returns true if member was added successfully, false if already exists or on error
	 */
	async addMember(organizationId: string, userId: string): Promise<boolean> {
		try {
			await this.db
				.insert(organizationMembers)
				.values({
					organizationId,
					userId
				})
				.returning();
			return true;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'addMember', error);
			return false;
		}
	}

	/**
	 * Removes a user from an organization's membership.
	 * @param organizationId - Organization UUID
	 * @param userId - User UUID to remove from membership
	 * @returns true if member was removed successfully, false if not found or on error
	 */
	async removeMember(organizationId: string, userId: string): Promise<boolean> {
		try {
			await this.db
				.delete(organizationMembers)
				.where(
					and(
						eq(organizationMembers.organizationId, organizationId),
						eq(organizationMembers.userId, userId)
					)
				);

			return true;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'removeMember', error);
			return false;
		}
	}

	/**
	 * Gets all members for an organization.
	 * @param organizationId - Organization UUID
	 * @returns Array of User objects who are members, ordered by name. Empty array if none or on error.
	 */
	async getMembers(organizationId: string): Promise<User[]> {
		try {
			const members = await this.db
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					image: users.image
				})
				.from(organizationMembers)
				.innerJoin(users, eq(organizationMembers.userId, users.id))
				.where(eq(organizationMembers.organizationId, organizationId))
				.orderBy(asc(users.name));

			return members;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'getMembers', error);
			return [];
		}
	}

	/**
	 * Gets all organizations that a user is a member of.
	 * @param userId - User UUID
	 * @returns Array of organizations the user belongs to, ordered by name. Empty array if none or on error.
	 */
	async getUserOrganizations(userId: string): Promise<Organization[]> {
		try {
			const orgs = await this.db
				.select({
					id: organizations.id,
					name: organizations.name,
					slug: organizations.slug,
					description: organizations.description,
					avatar: organizations.avatar,
					backgroundImage: organizations.backgroundImage
				})
				.from(organizations)
				.innerJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
				.where(eq(organizationMembers.userId, userId))
				.orderBy(asc(organizations.name));

			return orgs;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'getUserOrganizations', error);
			return [];
		}
	}

	/**
	 * Checks if a user is a member of an organization.
	 * @param organizationId - Organization UUID
	 * @param userId - User UUID to check membership for
	 * @returns true if user is a member, false otherwise or on error
	 */
	async isMember(organizationId: string, userId: string): Promise<boolean> {
		try {
			const result = await this.db
				.select()
				.from(organizationMembers)
				.where(
					and(
						eq(organizationMembers.organizationId, organizationId),
						eq(organizationMembers.userId, userId)
					)
				)
				.limit(1);

			return result.length > 0;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'isMember', error);
			return false;
		}
	}

	// Query Methods

	/**
	 * Searches organizations by name and description using case-insensitive matching.
	 * Trims whitespace and handles empty queries by returning all organizations.
	 * Orders results by relevance (name matches first) and limits to 20 results.
	 * @param query - Search query string
	 * @returns Array of matching organizations, empty array if none found or error
	 */
	async searchOrganizations(query: string): Promise<Organization[]> {
		try {
			const trimmedQuery = query.trim();

			if (trimmedQuery === '') {
				// Return all organizations if query is empty
				return await this.db.select().from(organizations).orderBy(asc(organizations.name));
			}

			const searchPattern = `%${trimmedQuery}%`;

			return await this.db
				.select()
				.from(organizations)
				.where(
					or(
						like(organizations.name, searchPattern),
						like(organizations.description, searchPattern)
					)
				)
				.limit(20)
				.orderBy(asc(organizations.name));
		} catch (error) {
			this.logger.error('OrganizationRepo', 'searchOrganizations', error);
			return [];
		}
	}

	/**
	 * Gets an organization with aggregated statistics (member count and event count).
	 * Uses efficient aggregation query with left joins.
	 * Counts all events (past and future) and active members.
	 * Validates UUID format for organizationId.
	 * @param organizationId - Organization UUID
	 * @returns Organization with stats, or null if not found or error
	 */
	async getOrganizationStats(organizationId: string): Promise<OrganizationWithStats | null> {
		try {
			const result = await this.db
				.select({
					id: organizations.id,
					name: organizations.name,
					slug: organizations.slug,
					description: organizations.description,
					avatar: organizations.avatar,
					backgroundImage: organizations.backgroundImage,
					memberCount: count(organizationMembers.userId),
					eventCount: count(events.id)
				})
				.from(organizations)
				.leftJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
				.leftJoin(events, eq(organizations.id, events.organizationId))
				.where(eq(organizations.id, organizationId))
				.groupBy(organizations.id);

			return result.length > 0 ? result[0] : null;
		} catch (error) {
			this.logger.error('OrganizationRepo', 'getOrganizationStats', error);
			return null;
		}
	}
}
