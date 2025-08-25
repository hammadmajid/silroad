import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionRepo } from '$lib/repos/session';
import type { User, SerializableSession } from '$lib/types';

vi.mock('$lib/db', () => ({
	getDb: vi.fn(),
	getKV: vi.fn(),
	getLogger: vi.fn()
}));

vi.mock('$lib/utils/crypto', () => ({
	generateSessionToken: vi.fn()
}));

describe('SessionRepo', () => {
	let sessionRepo: SessionRepo;
	let mockDb: any;
	let mockKV: any;
	let mockLogger: any;

	beforeEach(async () => {
		mockDb = {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			innerJoin: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returning: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			set: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis()
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

		sessionRepo = new SessionRepo(undefined);
	});

	describe('getByToken', () => {
		it('should return session from KV when found and not expired', async () => {
			const mockSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString()
			};

			mockKV.get.mockResolvedValue(JSON.stringify(mockSession));

			const result = await sessionRepo.getByToken('token123');

			expect(result).toEqual(mockSession);
		});

		it('should delete expired session from KV and return null', async () => {
			const expiredSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() - 1000).toISOString()
			};

			mockKV.get.mockResolvedValue(JSON.stringify(expiredSession));

			const result = await sessionRepo.getByToken('token123');

			expect(result).toBeNull();
			expect(mockKV.delete).toHaveBeenCalledWith('token123');
		});

		it('should fallback to database when not in KV', async () => {
			const dbSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60)
			};

			mockKV.get.mockResolvedValue(null);
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([dbSession]);

			const result = await sessionRepo.getByToken('token123');

			expect(result).toEqual({
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: dbSession.sessionExpiresAt.toISOString()
			});
		});

		it('should return null when session not found', async () => {
			mockKV.get.mockResolvedValue(null);
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await sessionRepo.getByToken('token123');

			expect(result).toBeNull();
		});

		it('should return null and log error on database error', async () => {
			mockKV.get.mockRejectedValue(new Error('KV error'));

			const result = await sessionRepo.getByToken('token123');

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'getByToken', JSON.stringify(new Error('KV error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('create', () => {
		it('should create session and store in both database and KV', async () => {
			const user: User = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null
			};

			const { generateSessionToken } = await import('$lib/utils/crypto');
			vi.mocked(generateSessionToken).mockReturnValue('token123');

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockResolvedValue(undefined);
			mockKV.put.mockResolvedValue(undefined);

			const result = await sessionRepo.create(user);

			expect(result).toEqual({
				token: 'token123',
				expiresAt: expect.any(Date)
			});
			expect(mockKV.put).toHaveBeenCalledWith('token123', expect.any(String));
		});

		it('should return null and log error on database error', async () => {
			const user: User = {
				id: 'user-1',
				email: 'test@example.com',
				name: 'Test User',
				image: null
			};

			const { generateSessionToken } = await import('$lib/utils/crypto');
			vi.mocked(generateSessionToken).mockReturnValue('token123');

			mockDb.insert.mockReturnValue(mockDb);
			mockDb.values.mockRejectedValue(new Error('Database error'));

			const result = await sessionRepo.create(user);

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'create', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('getByUserId', () => {
		it('should return all active sessions for user', async () => {
			const mockSessions = [
				{
					sessionToken: 'token1',
					userId: 'user-1',
					userImage: null,
					sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60)
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(mockSessions);

			const result = await sessionRepo.getByUserId('user-1');

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: mockSessions[0].sessionExpiresAt.toISOString()
			});
		});

		it('should return empty array on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await sessionRepo.getByUserId('user-1');

			expect(result).toEqual([]);
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'getByUserId', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('update', () => {
		it('should update session in KV', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date().toISOString()
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([{ sessionToken: 'token123' }]);
			mockKV.put.mockResolvedValue(undefined);

			const result = await sessionRepo.update(session);

			expect(result).toEqual(session);
			expect(mockKV.put).toHaveBeenCalledWith('token123', JSON.stringify(session));
		});

		it('should return null when session not found', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date().toISOString()
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockResolvedValue([]);

			const result = await sessionRepo.update(session);

			expect(result).toBeNull();
		});

		it('should return null and log error on database error', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date().toISOString()
			};

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.limit.mockRejectedValue(new Error('Database error'));

			const result = await sessionRepo.update(session);

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'update', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('delete', () => {
		it('should delete session from both database and KV', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(undefined);
			mockKV.delete.mockResolvedValue(undefined);

			await sessionRepo.delete('token123');

			expect(mockDb.delete).toHaveBeenCalled();
			expect(mockKV.delete).toHaveBeenCalledWith('token123');
		});

		it('should log error on database error', async () => {
			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			await sessionRepo.delete('token123');

			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'delete', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('deleteByUserId', () => {
		it('should delete all user sessions from database and KV', async () => {
			const userSessions = [{ sessionToken: 'token1' }, { sessionToken: 'token2' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValueOnce(userSessions).mockResolvedValueOnce(undefined);
			mockDb.delete.mockReturnValue(mockDb);
			mockKV.delete.mockResolvedValue(undefined);

			const result = await sessionRepo.deleteByUserId('user-1');

			expect(result).toBe(2);
			expect(mockKV.delete).toHaveBeenCalledTimes(2);
		});

		it('should return 0 and log error on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await sessionRepo.deleteByUserId('user-1');

			expect(result).toBe(0);
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: [
					'error',
					'SessionRepo',
					'deleteByUserId',
					JSON.stringify(new Error('Database error'))
				],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('invalidate', () => {
		it('should invalidate session by setting expiry to past and removing from KV', async () => {
			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(undefined);
			mockKV.delete.mockResolvedValue(undefined);

			await sessionRepo.invalidate('token123');

			expect(mockDb.update).toHaveBeenCalled();
			expect(mockKV.delete).toHaveBeenCalledWith('token123');
		});

		it('should log error on database error', async () => {
			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			await sessionRepo.invalidate('token123');

			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'invalidate', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('refresh', () => {
		it('should refresh session expiry and update KV when close to expiring', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24 hours
			};

			const dbSession = {
				userId: 'user-1'
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValueOnce([dbSession]);

			mockKV.put.mockResolvedValue(undefined);

			const result = await sessionRepo.refresh('token123', session);

			expect(result).toMatchObject({
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: expect.any(String)
			});
			expect(mockKV.put).toHaveBeenCalledWith('token123', expect.any(String));
		});

		it('should return session unchanged when not close to expiring', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days
			};

			const result = await sessionRepo.refresh('token123', session);

			expect(result).toEqual(session);
			expect(mockDb.update).not.toHaveBeenCalled();
			expect(mockKV.put).not.toHaveBeenCalled();
		});

		it('should return null when session not found in database', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24 hours
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockResolvedValue([]);

			const result = await sessionRepo.refresh('token123', session);

			expect(result).toBeNull();
		});

		it('should return null and log error on database error', async () => {
			const session: SerializableSession = {
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() // 24 hours
			};

			mockDb.update.mockReturnValue(mockDb);
			mockDb.set.mockReturnValue(mockDb);
			mockDb.where.mockReturnValue(mockDb);
			mockDb.returning.mockRejectedValue(new Error('Database error'));

			const result = await sessionRepo.refresh('token123', session);

			expect(result).toBeNull();
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'refresh', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('getExpired', () => {
		it('should return expired sessions', async () => {
			const expiredSessions = [
				{
					userId: 'user-1',
					userImage: null,
					sessionExpiresAt: new Date(Date.now() - 1000)
				}
			];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValue(expiredSessions);

			const before = new Date();
			const result = await sessionRepo.getExpired(before);

			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				userId: 'user-1',
				userImage: null,
				sessionExpiresAt: expect.any(String)
			});
		});

		it('should return empty array and log error on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.innerJoin.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const before = new Date();
			const result = await sessionRepo.getExpired(before);

			expect(result).toEqual([]);
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: ['error', 'SessionRepo', 'getExpired', JSON.stringify(new Error('Database error'))],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});

	describe('deleteExpired', () => {
		it('should delete expired sessions from database and KV', async () => {
			const expiredSessions = [{ sessionToken: 'token1' }, { sessionToken: 'token2' }];

			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValueOnce(expiredSessions);

			mockDb.delete.mockReturnValue(mockDb);
			mockDb.where.mockResolvedValueOnce(undefined);

			mockKV.delete.mockResolvedValue(undefined);

			const result = await sessionRepo.deleteExpired();

			expect(result).toBe(2);
			expect(mockKV.delete).toHaveBeenCalledTimes(2);
		});

		it('should return 0 and log error on database error', async () => {
			mockDb.select.mockReturnValue(mockDb);
			mockDb.from.mockReturnValue(mockDb);
			mockDb.where.mockRejectedValue(new Error('Database error'));

			const result = await sessionRepo.deleteExpired();

			expect(result).toBe(0);
			expect(mockLogger.writeDataPoint).toHaveBeenCalledWith({
				blobs: [
					'error',
					'SessionRepo',
					'deleteExpired',
					JSON.stringify(new Error('Database error'))
				],
				doubles: [1],
				indexes: [expect.any(String)]
			});
		});
	});
});
