import * as crypto from 'node:crypto';

const BYTE_LENGTH = 32;

export const generateSessionToken = () => {
	return crypto.randomBytes(BYTE_LENGTH).toString('base64url');
};

export const generateSalt = () => {
	return crypto.randomBytes(BYTE_LENGTH).toString('hex').normalize();
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
			if (error) reject(error);

			resolve(hash.toString('hex').normalize());
		});
	});
};

export const comparePassword = async (
	inputPassword: string,
	salt: string,
	hashedPassword: string
): Promise<boolean> => {
	const inputHashedPassword = await hashPassword(inputPassword, salt);

	return crypto.timingSafeEqual(
		Buffer.from(inputHashedPassword, 'hex'),
		Buffer.from(hashedPassword, 'hex')
	);
};
