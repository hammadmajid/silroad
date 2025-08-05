import { eq } from "drizzle-orm";
import { getDb } from "$lib/db";
import { users } from "$lib/db/schema";

export type User = {
  id: string;
  email: string;
  name: string;
  image: string | null;
}

export class UserRepo {
  private db;

  constructor(platform: App.Platform | undefined) {
    this.db = getDb(platform);
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          image: users.image
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return result[0] ?? null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async create(email: string, name: string, hashedPassword: string, salt: string): Promise<User | null> {
    try {
      const [user] = await this.db.insert(users).values({
        email,
        name,
        password: hashedPassword,
        salt,
        image: null
      }).returning();

      return {
        id: user.id,
        email,
        name,
        image: null
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(user: User): Promise<User> { throw "not implemented" }
  async delete(userId: string): Promise<void> { throw "not implemented" }
  async verifyPassword(password: string): Promise<boolean> { throw "not implemented" }
  async updatePassword(oldPass: string, newPass: string): Promise<boolean> { throw "not implemented" }
}
