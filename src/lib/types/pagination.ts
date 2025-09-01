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
