import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type Organization } from '$lib/types';
import { OrganizationRepo } from '$lib/repos/orgs';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

describe('OrganizationRepo - Member Management', () => {
	let orgRepo: OrganizationRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	const mockOrg: Organization = {
		id: 'org-1',
		name: 'Test Organization',
		slug: 'test-org',
		description: 'A test organization',
		avatar: null,
		backgroundImage: null
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
			delete: vi.fn().mockReturnThis(),
			innerJoin: vi.fn().mockReturnThis(),
			orderBy: vi.fn().mockReturnThis(),
			eq: vi.fn(),
			and: vi.fn()
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

	describe('addMember', () => {
		it('should add member successfully', async () => {
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([{ organizationId: 'org-1', userId: 'user-1' }]);

			const result = await orgRepo.addMember('org-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalledWith({
				organizationId: 'org-1',
				userId: 'user-1'
			});
		});

		it('should return false when member already exists', async () => {
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('UNIQUE constraint failed'));

			const result = await orgRepo.addMember('org-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should return false when organization does not exist', async () => {
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('FOREIGN KEY constraint failed'));

			const result = await orgRepo.addMember('nonexistent-org', 'user-1');

			expect(result).toBe(false);
		});

		it('should return false when user does not exist', async () => {
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('FOREIGN KEY constraint failed'));

			const result = await orgRepo.addMember('org-1', 'nonexistent-user');

			expect(result).toBe(false);
		});

		it('should return false on database error', async () => {
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.addMember('org-1', 'user-1');

			expect(result).toBe(false);
		});
	});

	describe('removeMember', () => {
		it('should remove member successfully', async () => {
			mockDb.delete.mockReturnValue(mockDb);

			await orgRepo.removeMember('org-1', 'user-1');

			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it('should return false on database error', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.removeMember('org-1', 'user-1');

			expect(result).toBe(false);
		});
	});

	describe('getMembers', () => {
		it('should return list of member user objects', async () => {
			const mockMembers = [
				{ id: 'user-1', name: 'User One', email: 'user1@example.com', image: null },
				{ id: 'user-2', name: 'User Two', email: 'user2@example.com', image: 'avatar2.jpg' },
				{ id: 'user-3', name: 'User Three', email: 'user3@example.com', image: null }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockMembers);

			const result = await orgRepo.getMembers('org-1');

			expect(result).toEqual(mockMembers);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizationMembers.organizationId, 'org-1')
		});

		it('should return empty array when no members', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getMembers('org-1');

			expect(result).toEqual([]);
		});

		it('should return empty array when organization does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue([]);

			const result = await orgRepo.getMembers('non-existent-org');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getMembers('org-1');

			expect(result).toEqual([]);
		});

		it('should order members by join date', async () => {
			const mockMembers = [
				{ id: 'user-2', name: 'User Two', email: 'user2@example.com', image: 'avatar2.jpg' },
				{ id: 'user-1', name: 'User One', email: 'user1@example.com', image: null },
				{ id: 'user-3', name: 'User Three', email: 'user3@example.com', image: null }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy = vi.fn().mockResolvedValue(mockMembers);

			const result = await orgRepo.getMembers('org-1');

			expect(result).toEqual(mockMembers);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});
	});

	describe('getUserOrganizations', () => {
		it('should return organizations for user', async () => {
			const mockOrgs = [mockOrg, { ...mockOrg, id: 'org-2', name: 'Second Org' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy.mockResolvedValue(mockOrgs);

			const result = await orgRepo.getUserOrganizations('user-1');

			expect(result).toEqual(mockOrgs);
			expect(mockDb.innerJoin).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizationMembers.userId, 'user-1')
		});

		it('should return empty array when user has no organizations', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue([]);

			const result = await orgRepo.getUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should return empty array when user does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue([]);

			const result = await orgRepo.getUserOrganizations('nonexistent-user');

			expect(result).toEqual([]);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getUserOrganizations('user-1');

			expect(result).toEqual([]);
		});

		it('should order organizations by name', async () => {
			const mockOrgs = [
				{ ...mockOrg, name: 'B Organization' },
				{ ...mockOrg, id: 'org-2', name: 'A Organization' }
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.orderBy = vi.fn().mockResolvedValue(mockOrgs);

			const result = await orgRepo.getUserOrganizations('user-1');

			expect(result).toEqual(mockOrgs);
			expect(mockDb.orderBy).toHaveBeenCalled();
		});
	});

	describe('isMember', () => {
		it('should return true when user is member', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ userId: 'user-1' }]);

			const result = await orgRepo.isMember('org-1', 'user-1');

			expect(result).toBe(true);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // and(eq(...), eq(...))
		});

		it('should return false when user is not member', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await orgRepo.isMember('org-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should return false when organization does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await orgRepo.isMember('nonexistent-org', 'user-1');

			expect(result).toBe(false);
		});

		it('should return false when user does not exist', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await orgRepo.isMember('org-1', 'nonexistent-user');

			expect(result).toBe(false);
		});

		it('should return false on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.isMember('org-1', 'user-1');

			expect(result).toBe(false);
		});

		it('should use efficient single query with limit 1', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ userId: 'user-1' }]);

			await orgRepo.isMember('org-1', 'user-1');

			expect(mockDb.limit).toHaveBeenCalledWith(1);
		});
	});
});
