import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	OrganizationRepo,
	type Organization,
	type OrganizationCreateData,
	type OrganizationUpdateData,
	type PaginationOptions
} from '$lib/repos/orgs';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('OrganizationRepo - CRUD Operations', () => {
	let orgRepo: OrganizationRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	const mockOrg: Organization = {
		id: 'org-1',
		name: 'Test Organization',
		slug: 'test-org',
		description: 'A test organization',
		avatar: 'https://example.com/avatar.jpg',
		backgroundImage: 'https://example.com/bg.jpg'
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

		orgRepo = new OrganizationRepo(undefined);
	});

	describe('create', () => {
		it('should create and return new organization with all fields', async () => {
			const createData: OrganizationCreateData = {
				name: 'Test Organization',
				slug: 'test-org',
				description: 'A test organization',
				avatar: 'https://example.com/avatar.jpg',
				backgroundImage: 'https://example.com/bg.jpg'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([mockOrg]);

			const result = await orgRepo.create(createData);

			expect(result).toEqual(mockOrg);
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Test Organization',
					slug: 'test-org',
					description: 'A test organization'
				})
			);
		});

		it('should create organization with minimal data', async () => {
			const createData: OrganizationCreateData = {
				name: 'Minimal Org',
				slug: 'minimal-org'
			};

			const minimalOrg = {
				id: 'org-2',
				name: 'Minimal Org',
				slug: 'minimal-org',
				description: null,
				avatar: null,
				backgroundImage: null
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([minimalOrg]);

			const result = await orgRepo.create(createData);

			expect(result).toEqual(minimalOrg);
		});

		it('should return null on database error', async () => {
			const createData: OrganizationCreateData = {
				name: 'Test Organization',
				slug: 'test-org'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.create(createData);

			expect(result).toBeNull();
		});

		it('should handle slug uniqueness constraint violation', async () => {
			const createData: OrganizationCreateData = {
				name: 'Test Organization',
				slug: 'existing-slug'
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('UNIQUE constraint failed: organizations.slug'));

			const result = await orgRepo.create(createData);

			expect(result).toBeNull();
		});
	});

	describe('getById', () => {
		it('should return organization when found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockOrg]);

			const result = await orgRepo.getById('org-1');

			expect(result).toEqual(mockOrg);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizations.id, 'org-1')
		});

		it('should return null when organization not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await orgRepo.getById('nonexistent');

			expect(result).toBeNull();
		});

		it('should return null on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getById('org-1');

			expect(result).toBeNull();
		});
	});

	describe('getBySlug', () => {
		it('should return organization when found by slug', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockOrg]);

			const result = await orgRepo.getBySlug('test-org');

			expect(result).toEqual(mockOrg);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizations.slug, 'test-org')
		});

		it('should return null when organization slug not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await orgRepo.getBySlug('nonexistent-slug');

			expect(result).toBeNull();
		});

		it('should return null on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getBySlug('test-org');

			expect(result).toBeNull();
		});
	});

	describe('update', () => {
		it('should update and return organization', async () => {
			const updateData: OrganizationUpdateData = {
				name: 'Updated Organization',
				description: 'Updated description'
			};

			const updatedOrg = { ...mockOrg, ...updateData };

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([updatedOrg]);

			const result = await orgRepo.update('org-1', updateData);

			expect(result).toEqual(updatedOrg);
			expect(mockDb.set).toHaveBeenCalledWith(updateData);
		});

		it('should return null when organization not found', async () => {
			const updateData: OrganizationUpdateData = {
				name: 'Updated Organization'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([]);

			const result = await orgRepo.update('nonexistent', updateData);

			expect(result).toBeNull();
		});

		it('should handle partial updates', async () => {
			const updateData: OrganizationUpdateData = {
				description: 'Only description updated'
			};

			const updatedOrg = { ...mockOrg, description: 'Only description updated' };

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([updatedOrg]);

			const result = await orgRepo.update('org-1', updateData);

			expect(result).toEqual(updatedOrg);
		});

		it('should handle slug uniqueness constraint violation on update', async () => {
			const updateData: OrganizationUpdateData = {
				slug: 'existing-slug'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('UNIQUE constraint failed: organizations.slug'));

			const result = await orgRepo.update('org-1', updateData);

			expect(result).toBeNull();
		});

		it('should return null on database error', async () => {
			const updateData: OrganizationUpdateData = {
				name: 'Updated Organization'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.update('org-1', updateData);

			expect(result).toBeNull();
		});
	});

	describe('delete', () => {
		it('should delete organization successfully', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue({ changes: 1 });

			const result = await orgRepo.delete('org-1');

			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('should return error when database error occurs', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.delete('org-1');

			expect(result).toBeInstanceOf(Error);
		});

		it('should return error when foreign key constraint is violated', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('FOREIGN KEY constraint failed'));

			const result = await orgRepo.delete('org-1');

			expect(result).toBeInstanceOf(Error);
			expect(result?.message).toContain('FOREIGN KEY constraint failed');
		});
	});

	describe('getAll', () => {
		it('should return paginated organizations with default pagination', async () => {
			const mockOrgs = [mockOrg, { ...mockOrg, id: 'org-2', name: 'Second Org' }];
			const totalCount = 2;

			// Mock the count query chain: this.db.select({ count: count() }).from(organizations)
			mockDb.select.mockReturnValueOnce(mockDb);
			mockDb.from.mockReturnValueOnce([{ count: totalCount }]);

			// Mock the data query chain: this.db.select().from(organizations).orderBy(...).limit(...).offset(...)
			mockDb.select.mockReturnValueOnce(mockDb);
			mockDb.from.mockReturnValueOnce(mockDb);
			mockDb.orderBy.mockReturnValueOnce(mockDb);
			mockDb.limit.mockReturnValueOnce(mockDb);
			mockDb.offset.mockResolvedValueOnce(mockOrgs);

			const result = await orgRepo.getAll();

			expect(result).toEqual({
				data: mockOrgs,
				pagination: {
					page: 1,
					pageSize: 10,
					totalCount: 2,
					totalPages: 1
				}
			});
		});

		it('should return paginated organizations with custom pagination', async () => {
			const mockOrgs = [mockOrg];
			const totalCount = 15;
			const pagination: PaginationOptions = { page: 2, pageSize: 5 };

			// Mock the count query chain: this.db.select({ count: count() }).from(organizations)
			mockDb.select.mockReturnValueOnce(mockDb);
			mockDb.from.mockReturnValueOnce([{ count: totalCount }]);

			// Mock the data query chain: this.db.select().from(organizations).orderBy(...).limit(...).offset(...)
			mockDb.select.mockReturnValueOnce(mockDb);
			mockDb.from.mockReturnValueOnce(mockDb);
			mockDb.orderBy.mockReturnValueOnce(mockDb);
			mockDb.limit.mockReturnValueOnce(mockDb);
			mockDb.offset.mockResolvedValueOnce(mockOrgs);

			const result = await orgRepo.getAll(pagination);

			expect(result).toEqual({
				data: mockOrgs,
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

			const result = await orgRepo.getAll();

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

		it('should handle page out of bounds gracefully', async () => {
			const pagination: PaginationOptions = { page: 100, pageSize: 10 };

			// Mock the count query chain
			mockDb.select.mockReturnValueOnce(mockDb);
			mockDb.from.mockReturnValueOnce([{ count: 5 }]);

			// Mock the data query chain
			mockDb.select.mockReturnValueOnce(mockDb);
			mockDb.from.mockReturnValueOnce(mockDb);
			mockDb.orderBy.mockReturnValueOnce(mockDb);
			mockDb.limit.mockReturnValueOnce(mockDb);
			mockDb.offset.mockResolvedValueOnce([]);

			const result = await orgRepo.getAll(pagination);

			expect(result).toEqual({
				data: [],
				pagination: {
					page: 100,
					pageSize: 10,
					totalCount: 5,
					totalPages: 1
				}
			});
		});

		it('should sort organizations by name ascending by default', async () => {
			const mockOrgs = [mockOrg];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockResolvedValue(mockOrgs);

			mockDb.count.mockResolvedValue([{ count: 1 }]);

			await orgRepo.getAll();

			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should return empty result on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.offset.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getAll();

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
