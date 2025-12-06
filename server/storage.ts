import { 
  users, 
  savedInquiries, 
  breachMonitors, 
  chatMessages,
  type User, 
  type InsertUser,
  type SavedInquiry,
  type InsertSavedInquiry,
  type BreachMonitor,
  type InsertBreachMonitor,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  
  getSavedInquiries(userId: string): Promise<SavedInquiry[]>;
  createSavedInquiry(inquiry: InsertSavedInquiry): Promise<SavedInquiry>;
  deleteSavedInquiry(id: string): Promise<void>;
  
  getBreachMonitors(userId: string): Promise<BreachMonitor[]>;
  getBreachMonitorByEmail(userId: string, email: string): Promise<BreachMonitor | undefined>;
  createBreachMonitor(monitor: InsertBreachMonitor): Promise<BreachMonitor>;
  updateBreachMonitor(id: string, data: Partial<BreachMonitor>): Promise<BreachMonitor | undefined>;
  
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getSavedInquiries(userId: string): Promise<SavedInquiry[]> {
    return db
      .select()
      .from(savedInquiries)
      .where(eq(savedInquiries.userId, userId))
      .orderBy(desc(savedInquiries.createdAt));
  }

  async createSavedInquiry(inquiry: InsertSavedInquiry): Promise<SavedInquiry> {
    const [saved] = await db
      .insert(savedInquiries)
      .values(inquiry)
      .returning();
    return saved;
  }

  async deleteSavedInquiry(id: string): Promise<void> {
    await db.delete(savedInquiries).where(eq(savedInquiries.id, id));
  }

  async getBreachMonitors(userId: string): Promise<BreachMonitor[]> {
    return db
      .select()
      .from(breachMonitors)
      .where(eq(breachMonitors.userId, userId))
      .orderBy(desc(breachMonitors.createdAt));
  }

  async getBreachMonitorByEmail(userId: string, email: string): Promise<BreachMonitor | undefined> {
    const [monitor] = await db
      .select()
      .from(breachMonitors)
      .where(and(eq(breachMonitors.userId, userId), eq(breachMonitors.email, email)));
    return monitor || undefined;
  }

  async createBreachMonitor(monitor: InsertBreachMonitor): Promise<BreachMonitor> {
    const [created] = await db
      .insert(breachMonitors)
      .values(monitor)
      .returning();
    return created;
  }

  async updateBreachMonitor(id: string, data: Partial<BreachMonitor>): Promise<BreachMonitor | undefined> {
    const [updated] = await db
      .update(breachMonitors)
      .set(data)
      .where(eq(breachMonitors.id, id))
      .returning();
    return updated || undefined;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
