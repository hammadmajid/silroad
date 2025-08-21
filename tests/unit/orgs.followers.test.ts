import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrganizationRepo } from '$lib/repos/orgs';

vi.mock('$lib/db', () => ({
	getDb: vi.fn()
}));

vi.mock('$lib/utils/logger', () => ({
	Logger: vi.fn().mockImplementation(() => ({
		error: vi.fn()
	}))
}));

describe('OrganizationRepo - Followers', () => {
	let orgRepo: OrganizationRepo;
	let mockDb: any;

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
			leftJoin: vi.fn().mockReturnThis()
		};

		const { getDb } = await import('$lib/db');
		vi.mocked(getDb).mockReturnValue(mockDb);

		orgRepo = new OrganizationRepo(undefined);
	});

	describe('toggleFollow', () => {
		it('should unfollow organization if user already follows', async () => {
			// Mock delete returns row -> means unfollow
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([{ organizationId: 'org-1' }]);

			const result = await orgRepo.toggleFollow('user-1', 'org-1');

			expect(result).toBe('unfollowed');
			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.returning).toHaveBeenCalled();
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it('should follow organization if user is not following', async () => {
			// Mock delete returns nothing
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([]);

			// Mock insert success
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockResolvedValueOnce([{ userId: 'user-1', organizationId: 'org-1' }]);

			const result = await orgRepo.toggleFollow('user-1', 'org-1');

			expect(result).toBe('followed');
			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalledWith({ userId: 'user-1', organizationId: 'org-1' });
		});

		it('should throw if delete operation fails', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValueOnce(new Error('Delete failed'));

			await expect(orgRepo.toggleFollow('user-1', 'org-1')).rejects.toThrow('Delete failed');
		});

		it('should throw if insert operation fails', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([]); // nothing deleted → must insert

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockRejectedValueOnce(new Error('Insert failed'));

			await expect(orgRepo.toggleFollow('user-1', 'org-1')).rejects.toThrow('Insert failed');
		});

		it('should correctly return state when concurrent insert causes unique constraint violation', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([]); // nothing deleted

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockRejectedValueOnce(new Error('UNIQUE constraint failed'));

			await expect(orgRepo.toggleFollow('user-1', 'org-1')).rejects.toThrow(
				'UNIQUE constraint failed'
			);
		});
	});

	describe('getUserFollowing', () => {
		const mockFollowedOrgs = [
			{
				id: 'org-1',
				name: 'First Org',
				slug: 'first-org',
				avatar: 'avatar1.jpg',
				description: 'First organization',
				backgroundImage: 'bg1.jpg'
			},
			{
				id: 'org-2',
				name: 'Second Org',
				slug: 'second-org',
				avatar: 'avatar2.jpg',
				description: 'Second organization',
				backgroundImage: 'bg2.jpg'
			}
		];

		it('should return list of organizations user follows', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(mockFollowedOrgs);

			const result = await orgRepo.getUserFollowing('user-1');

			expect(result).toEqual(mockFollowedOrgs);
			expect(mockDb.where).toHaveBeenCalledWith(expect.anything()); // eq(organizationFollowers.userId, 'user-1')
		});

		it('should return empty array when user follows no organizations', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue([]);

			const result = await orgRepo.getUserFollowing('user-1');

			expect(result).toEqual([]);
		});

		it('should filter out null organizations from join', async () => {
			const mixedResults = [
				{
					id: 'org-1',
					name: 'Valid Org',
					slug: 'valid-org',
					avatar: 'avatar.jpg',
					description: 'Valid organization',
					backgroundImage: 'bg.jpg'
				},
				{
					id: null,
					name: null,
					slug: null,
					avatar: null,
					description: null,
					backgroundImage: null
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(mixedResults);

			const result = await orgRepo.getUserFollowing('user-1');

			expect(result).toEqual([mixedResults[0]]);
			expect(result).toHaveLength(1);
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await orgRepo.getUserFollowing('user-1');

			expect(result).toEqual([]);
		});

		it('should handle malformed organization data gracefully', async () => {
			const malformedResults = [
				{
					id: 'org-1',
					name: 'Valid Org',
					slug: 'valid-org',
					avatar: 'avatar.jpg',
					description: 'Valid organization',
					backgroundImage: 'bg.jpg'
				},
				{
					id: 'org-2',
					name: '', // Empty name should be filtered out
					slug: 'empty-name',
					avatar: null,
					description: null,
					backgroundImage: null
				},
				{
					id: 'org-3',
					name: 'Valid Name',
					slug: '', // Empty slug should be filtered out
					avatar: null,
					description: null,
					backgroundImage: null
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(malformedResults);

			const result = await orgRepo.getUserFollowing('user-1');

			// Only the first organization should pass the filter
			expect(result).toEqual([malformedResults[0]]);
			expect(result).toHaveLength(1);
		});

		it('should return correctly typed Organization objects', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.leftJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(mockFollowedOrgs);

			const result = await orgRepo.getUserFollowing('user-1');

			result.forEach((org) => {
				expect(org).toHaveProperty('id');
				expect(org).toHaveProperty('name');
				expect(org).toHaveProperty('slug');
				expect(org).toHaveProperty('description');
				expect(org).toHaveProperty('avatar');
				expect(org).toHaveProperty('backgroundImage');
				expect(typeof org.id).toBe('string');
				expect(typeof org.name).toBe('string');
				expect(typeof org.slug).toBe('string');
			});
		});
	});
});
