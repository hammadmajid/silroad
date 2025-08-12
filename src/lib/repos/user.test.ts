import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepo } from './user';
import { hashPassword } from '$lib/utils/crypto';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getLogger: vi.fn()
}));

vi.mock('$lib/utils/crypto', () => ({
	comparePassword: vi.fn(),
	hashPassword: vi.fn()
}));

describe('UserRepo', () => {
	let userRepo: UserRepo;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockDb: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockLogger: any;

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
			delete: vi.fn().mockReturnThis()
		};

		mockLogger = {
			writeDataPoint: vi.fn()
		};

		const { getDb, getLogger } = await import('$lib/db');
		vi.mocked(getDb).mockReturnValue(mockDb);
		vi.mocked(getLogger).mockReturnValue(mockLogger);

		userRepo = new UserRepo(undefined);
	});

	describe('getByEmail', () => {
		it('should return user when found', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockUser]);

			const result = await userRepo.getByEmail('test@example.com');

			expect(result).toEqual(mockUser);
		});

		it('should return null when user not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await userRepo.getByEmail('notfound@example.com');

			expect(result).toBeNull();
		});

		it('should return null and log error on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await userRepo.getByEmail('test@example.com');

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'UserRepo', 'getByEmail', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('create', () => {
		it('should create and return new user', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				password: 'hashedpassword',
				salt: 'salt123',
				image: null
			};

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([mockUser]);

			const result = await userRepo.create(
				'test@example.com',
				'Test User',
				'hashedpassword',
				'salt123'
			);

			expect(result).toEqual({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null
			});
		});

		it('should return null and log error on database error', async () => {
			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await userRepo.create(
				'test@example.com',
				'Test User',
				'hashedpassword',
				'salt123'
			);

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'UserRepo', 'create', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('verify', () => {
		it('should return user when credentials are valid', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null,
				password: 'hashedpassword',
				salt: 'salt123'
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue([mockUser]);

			const { comparePassword } = await import('$lib/utils/crypto');
			vi.mocked(comparePassword).mockResolvedValue(true);

			const result = await userRepo.verify('test@example.com', 'password123');

			expect(result).toEqual({
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null
			});
		});

		it('should return null when user not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue([]);

			const result = await userRepo.verify('notfound@example.com', 'password123');

			expect(result).toBeNull();
		});

		it('should return null when password is invalid', async () => {
			const mockUser = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null,
				password: 'hashedpassword',
				salt: 'salt123'
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue([mockUser]);

			const { comparePassword } = await import('$lib/utils/crypto');
			vi.mocked(comparePassword).mockResolvedValue(false);

			const result = await userRepo.verify('test@example.com', 'wrongpassword');

			expect(result).toBeNull();
		});

		it('should return null and log error on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await userRepo.verify('test@example.com', 'password123');

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'UserRepo', 'verify', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('update', () => {
		it('should update and return user', async () => {
			const user = {
				id: 'user-1',
				email: 'updated@example.com',
				name: 'Updated User',
				image: null
			};

			const updatedUser = {
				id: 'user-1',
				email: 'updated@example.com',
				name: 'Updated User',
				image: null
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([updatedUser]);

			const result = await userRepo.update(user);

			expect(result).toEqual(updatedUser);
		});

		it('should return null when user not found', async () => {
			const user = {
				id: 'nonexistent',
				email: 'updated@example.com',
				name: 'Updated User',
				image: null
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([]);

			const result = await userRepo.update(user);

			expect(result).toBeNull();
		});

		it('should return null and log error on database error', async () => {
			const user = {
				id: 'user-1',
				email: 'updated@example.com',
				name: 'Updated User',
				image: null
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await userRepo.update(user);

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'UserRepo', 'update', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('delete', () => {
		it('should delete user successfully', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(undefined);

			await userRepo.delete('user-1');

			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it('should log error on database error', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			await userRepo.delete('user-1');

			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'UserRepo', 'delete', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('updatePassword', () => {
		it('should update password when old password is correct', async () => {
			const mockUser = {
				password: 'oldhashed',
				salt: 'salt123'
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockUser]);

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);

			const { comparePassword } = await import('$lib/utils/crypto');
			vi.mocked(comparePassword).mockResolvedValue(true);
			vi.mocked(hashPassword).mockResolvedValue('newhashed');

			const result = await userRepo.updatePassword('user-1', 'oldpass', 'newpass');

			expect(result).toBe(true);
		});

		it('should return false when user not found', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await userRepo.updatePassword('nonexistent', 'oldpass', 'newpass');

			expect(result).toBe(false);
		});

		it('should return false when old password is incorrect', async () => {
			const mockUser = {
				password: 'oldhashed',
				salt: 'salt123'
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([mockUser]);

			const { comparePassword } = await import('$lib/utils/crypto');
			vi.mocked(comparePassword).mockResolvedValue(false);

			const result = await userRepo.updatePassword('user-1', 'wrongpass', 'newpass');

			expect(result).toBe(false);
		});

		it('should return false and log error on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await userRepo.updatePassword('user-1', 'oldpass', 'newpass');

			expect(result).toBe(false);
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'UserRepo', 'updatePassword', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});
});
