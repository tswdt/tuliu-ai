import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, otpRecords, transactions, generatedImages, InsertOTPRecord, InsertTransaction, InsertGeneratedImage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOTPRecord(data: InsertOTPRecord) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create OTP record: database not available");
    return;
  }

  await db.insert(otpRecords).values(data);
}

export async function getValidOTPRecord(email: string, otp: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get OTP record: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(otpRecords)
    .where(
      eq(otpRecords.email, email) &&
      eq(otpRecords.otp, otp)
    )
    .limit(1);

  if (result.length === 0) return undefined;

  const record = result[0];
  if (new Date() > record.expiresAt) {
    return undefined;
  }

  return record;
}

export async function deleteOTPRecord(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete OTP record: database not available");
    return;
  }

  await db.delete(otpRecords).where(eq(otpRecords.id, id));
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create transaction: database not available");
    return;
  }

  const result = await db.insert(transactions).values(data);
  return result;
}

export async function createGeneratedImage(data: InsertGeneratedImage) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create generated image: database not available");
    return;
  }

  const result = await db.insert(generatedImages).values(data);
  return result;
}

export async function updateGeneratedImage(id: number, data: Partial<InsertGeneratedImage>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update generated image: database not available");
    return;
  }

  await db.update(generatedImages).set(data).where(eq(generatedImages.id, id));
}

export async function getUserTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get transactions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .limit(limit);

  return result;
}

export async function getUserGeneratedImages(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get generated images: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(generatedImages)
    .where(eq(generatedImages.userId, userId))
    .limit(limit);

  return result;
}

export async function getAllUsers(limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  const result = await db.select().from(users).limit(limit);
  return result;
}

export async function updateUserCredits(userId: number, newCredits: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user credits: database not available");
    return;
  }

  await db.update(users).set({ credits: newCredits }).where(eq(users.id, userId));
}

export async function blockUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot block user: database not available");
    return;
  }

  await db.update(users).set({ isBlocked: 1 }).where(eq(users.id, userId));
}

export async function unblockUser(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot unblock user: database not available");
    return;
  }

  await db.update(users).set({ isBlocked: 0 }).where(eq(users.id, userId));
}

// TODO: add feature queries here as your schema grows.
