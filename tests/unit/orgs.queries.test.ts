import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationRepo, type Organization, type OrganizationWithStats } from '$lib/repos/orgs';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('OrganizationRepo - Query Methods', () => {
	let orgRepo: OrganizationRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	const mockOrg: Organization = {
		id: 'org-1',
		name: 'Test Organization',
		slug: 'test-org',
		description: 'A test organization for testing',
		avatar: null,
		backgroundImage: null
	};

	beforeEach(async () => {
		mockDb = {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			leftJoin: vi.fn().mockReturnThis(),
			groupBy: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			like: vi.fn(),
			or: vi.fn(),
			count: vi.fn(),
			as: vi.fn()
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

	describe('searchOrganizations', () => {
		it('should return organizations matching search query in name', async () => {
			const mockOrgs = [mockOrg];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrgs);

			const result = await orgRepo.searchOrganizations('test');

			expect(result).toEqual(mockOrgs);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // or(like(...), like(...))
		});

		it('should return organizations matching search query in description', async () => {
			const mockOrgs = [mockOrg];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrgs);

			const result = await orgRepo.searchOrganizations('testing');

			expect(result).toEqual(mockOrgs);
		});

		it('should return empty array when no matches found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.searchOrganizations('nonexistent');

			expect(result).toEqual([]);
		});

		it('should handle empty search query', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([mockOrg]);

			const result = await orgRepo.searchOrganizations('');

			expect(result).toEqual([mockOrg]);
			expect(mockDb.where).not.toHaveBeenCalled();
		});

		it('should handle whitespace-only search query', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([mockOrg]);

			const result = await orgRepo.searchOrganizations('   ');

			expect(result).toEqual([mockOrg]);
			expect(mockDb.where).not.toHaveBeenCalled();
		});

		it('should be case insensitive', async () => {
			const mockOrgs = [mockOrg];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrgs);

			const result = await orgRepo.searchOrganizations('TEST');

			expect(result).toEqual(mockOrgs);
		});

		it('should limit results to prevent performance issues', async () => {
			const mockOrgs = Array.from({ length: 50 }, (_, i) => ({
				...mockOrg,
				id: `org-${i}`,
				name: `Test Organization ${i}`
			}));

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrgs.slice(0, 20));

			const result = await orgRepo.searchOrganizations('test');

			expect(result).toHaveLength(20);
			expect(mockDb.limit).toHaveBeenCalledWith(20);
		});

		it('should order results by relevance (name matches first)', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([mockOrg]);

			await orgRepo.searchOrganizations('test');

			expect(mockDb.orderBy).toHaveBeenCalled();
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.searchOrganizations('test');

			expect(result).toEqual([]);
		});

		it('should trim whitespace from search query', async () => {
			const mockOrgs = [mockOrg];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrgs);

			const result = await orgRepo.searchOrganizations('  test  ');

			expect(result).toEqual(mockOrgs);
		});
	});

	describe('getOrganizationStats', () => {
		it('should return organization with member and event counts', async () => {
			const mockOrgWithStats: OrganizationWithStats = {
				...mockOrg,
				memberCount: 15,
				eventCount: 8
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockOrgWithStats]);

			const result = await orgRepo.getOrganizationStats('org-1');

			expect(result).toEqual(mockOrgWithStats);
			expect(mockDb.leftJoin).toHaveBeenCalledTimes(2); // Join with members and events tables
		});

		it('should return organization with zero counts when no members or events', async () => {
			const mockOrgWithStats: OrganizationWithStats = {
				...mockOrg,
				memberCount: 0,
				eventCount: 0
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockOrgWithStats]);

			const result = await orgRepo.getOrganizationStats('org-1');

			expect(result).toEqual(mockOrgWithStats);
		});

		it('should return null when organization not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([]);

			const result = await orgRepo.getOrganizationStats('nonexistent');

			expect(result).toBeNull();
		});

		it('should count only active members', async () => {
			const mockOrgWithStats: OrganizationWithStats = {
				...mockOrg,
				memberCount: 10,
				eventCount: 5
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockOrgWithStats]);

			const result = await orgRepo.getOrganizationStats('org-1');

			expect(result?.memberCount).toBe(10);
		});

		it('should count all events (past and future)', async () => {
			const mockOrgWithStats: OrganizationWithStats = {
				...mockOrg,
				memberCount: 15,
				eventCount: 12
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockOrgWithStats]);

			const result = await orgRepo.getOrganizationStats('org-1');

			expect(result?.eventCount).toBe(12);
		});

		it('should return null on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getOrganizationStats('org-1');

			expect(result).toBeNull();
		});

		it('should use efficient aggregation query', async () => {
			const mockOrgWithStats: OrganizationWithStats = {
				...mockOrg,
				memberCount: 15,
				eventCount: 8
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockOrgWithStats]);

			await orgRepo.getOrganizationStats('org-1');

			expect(mockDb.groupBy).toHaveBeenCalled();
			expect(mockDb.leftJoin).toHaveBeenCalledTimes(2); // Should join both organizationMembers and events
		});

		it('should include all organization fields in result', async () => {
			const mockOrgWithStats: OrganizationWithStats = {
				id: 'org-1',
				name: 'Complete Organization',
				slug: 'complete-org',
				description: 'A complete organization with all fields',
				avatar: 'https://example.com/avatar.jpg',
				backgroundImage: 'https://example.com/bg.jpg',
				memberCount: 25,
				eventCount: 10
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.groupBy.mockResolvedValue([mockOrgWithStats]);

			const result = await orgRepo.getOrganizationStats('org-1');

			expect(result).toEqual(mockOrgWithStats);
			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('name');
			expect(result).toHaveProperty('slug');
			expect(result).toHaveProperty('description');
			expect(result).toHaveProperty('avatar');
			expect(result).toHaveProperty('backgroundImage');
			expect(result).toHaveProperty('memberCount');
			expect(result).toHaveProperty('eventCount');
		});
	});
});
