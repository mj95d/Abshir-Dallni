import { 
  users, 
  savedInquiries, 
  breachMonitors, 
  chatMessages,
  shieldUsers,
  shieldBreaches,
  shieldNotifications,
  savedQueries,
  userDevices,
  supportTickets,
  ticketComments,
  type User, 
  type InsertUser,
  type SavedInquiry,
  type InsertSavedInquiry,
  type BreachMonitor,
  type InsertBreachMonitor,
  type ChatMessage,
  type InsertChatMessage,
  type ShieldUser,
  type InsertShieldUser,
  type ShieldBreach,
  type InsertShieldBreach,
  type ShieldNotification,
  type InsertShieldNotification,
  type SavedQuery,
  type InsertSavedQuery,
  type UserDevice,
  type InsertUserDevice,
  type SupportTicket,
  type InsertSupportTicket,
  type TicketComment,
  type InsertTicketComment,
  type TicketStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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
  
  getShieldUserByEmail(email: string): Promise<ShieldUser | undefined>;
  getAllConsentedShieldUsers(): Promise<ShieldUser[]>;
  createShieldUser(user: InsertShieldUser): Promise<ShieldUser>;
  updateShieldUser(email: string, data: Partial<InsertShieldUser>): Promise<ShieldUser | undefined>;
  deleteShieldUser(email: string): Promise<void>;
  
  getShieldBreachesByEmail(email: string): Promise<ShieldBreach[]>;
  createShieldBreach(breach: InsertShieldBreach): Promise<ShieldBreach>;
  hasExistingBreach(email: string, breachName: string, source: string): Promise<boolean>;
  
  createShieldNotification(notification: InsertShieldNotification): Promise<ShieldNotification>;
  getShieldNotificationsByEmail(email: string): Promise<ShieldNotification[]>;
  
  getSavedQueries(userId: string): Promise<SavedQuery[]>;
  getSavedQueryByServiceKey(userId: string, serviceKey: string): Promise<SavedQuery | undefined>;
  createSavedQuery(query: InsertSavedQuery): Promise<SavedQuery>;
  updateSavedQueryUsage(id: string): Promise<SavedQuery | undefined>;
  deleteSavedQuery(id: string): Promise<void>;
  getDefaultSavedQueries(): SavedQuery[];
  
  getUserDevices(userId: string): Promise<UserDevice[]>;
  getDeviceByUserAgent(userId: string, userAgent: string): Promise<UserDevice | undefined>;
  createUserDevice(device: InsertUserDevice): Promise<UserDevice>;
  updateDeviceLastSeen(id: string): Promise<UserDevice | undefined>;
  deleteUserDevice(id: string): Promise<void>;
  
  getAllTickets(): Promise<SupportTicket[]>;
  getTicketsByEmail(email: string): Promise<SupportTicket[]>;
  getTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  getTicketById(id: string): Promise<SupportTicket | undefined>;
  createTicket(data: InsertSupportTicket): Promise<SupportTicket>;
  updateTicketStatus(id: string, status: TicketStatus, actorName: string): Promise<SupportTicket | undefined>;
  updateTicketAiSolution(id: string, aiSolution: SupportTicket["aiSolution"]): Promise<SupportTicket | undefined>;
  updateTicketAdminNotes(id: string, notes: string): Promise<SupportTicket | undefined>;
  deleteTicket(id: string): Promise<void>;
  
  getTicketComments(ticketId: string): Promise<TicketComment[]>;
  addTicketComment(comment: InsertTicketComment): Promise<TicketComment>;
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

  async getShieldUserByEmail(email: string): Promise<ShieldUser | undefined> {
    const [user] = await db.select().from(shieldUsers).where(eq(shieldUsers.email, email.toLowerCase()));
    return user || undefined;
  }

  async getAllConsentedShieldUsers(): Promise<ShieldUser[]> {
    return db.select().from(shieldUsers).where(eq(shieldUsers.consent, true));
  }

  async createShieldUser(user: InsertShieldUser): Promise<ShieldUser> {
    const [created] = await db
      .insert(shieldUsers)
      .values({ ...user, email: user.email.toLowerCase() })
      .returning();
    return created;
  }

  async updateShieldUser(email: string, data: Partial<InsertShieldUser>): Promise<ShieldUser | undefined> {
    const [updated] = await db
      .update(shieldUsers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(shieldUsers.email, email.toLowerCase()))
      .returning();
    return updated || undefined;
  }

  async deleteShieldUser(email: string): Promise<void> {
    await db.delete(shieldUsers).where(eq(shieldUsers.email, email.toLowerCase()));
  }

  async getShieldBreachesByEmail(email: string): Promise<ShieldBreach[]> {
    return db
      .select()
      .from(shieldBreaches)
      .where(eq(shieldBreaches.email, email.toLowerCase()))
      .orderBy(desc(shieldBreaches.seenAt));
  }

  async createShieldBreach(breach: InsertShieldBreach): Promise<ShieldBreach> {
    const [created] = await db
      .insert(shieldBreaches)
      .values({ ...breach, email: breach.email.toLowerCase() })
      .returning();
    return created;
  }

  async hasExistingBreach(email: string, breachName: string, source: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(shieldBreaches)
      .where(
        and(
          eq(shieldBreaches.email, email.toLowerCase()),
          eq(shieldBreaches.breachName, breachName),
          eq(shieldBreaches.source, source)
        )
      );
    return !!existing;
  }

  async createShieldNotification(notification: InsertShieldNotification): Promise<ShieldNotification> {
    const [created] = await db
      .insert(shieldNotifications)
      .values({ ...notification, email: notification.email.toLowerCase() })
      .returning();
    return created;
  }

  async getShieldNotificationsByEmail(email: string): Promise<ShieldNotification[]> {
    return db
      .select()
      .from(shieldNotifications)
      .where(eq(shieldNotifications.email, email.toLowerCase()))
      .orderBy(desc(shieldNotifications.sentAt));
  }

  async getSavedQueries(userId: string): Promise<SavedQuery[]> {
    return db
      .select()
      .from(savedQueries)
      .where(eq(savedQueries.userId, userId))
      .orderBy(desc(savedQueries.usageCount));
  }

  async getSavedQueryByServiceKey(userId: string, serviceKey: string): Promise<SavedQuery | undefined> {
    const [query] = await db
      .select()
      .from(savedQueries)
      .where(and(eq(savedQueries.userId, userId), eq(savedQueries.serviceKey, serviceKey)));
    return query || undefined;
  }

  async createSavedQuery(query: InsertSavedQuery): Promise<SavedQuery> {
    const [created] = await db
      .insert(savedQueries)
      .values(query)
      .returning();
    return created;
  }

  async updateSavedQueryUsage(id: string): Promise<SavedQuery | undefined> {
    const [updated] = await db
      .update(savedQueries)
      .set({ 
        usageCount: sql`${savedQueries.usageCount} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(savedQueries.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteSavedQuery(id: string): Promise<void> {
    await db.delete(savedQueries).where(eq(savedQueries.id, id));
  }

  getDefaultSavedQueries(): SavedQuery[] {
    return [
      {
        id: "default-1",
        userId: null,
        title: "Iqama Renewal Steps",
        titleAr: "خطوات تجديد الإقامة",
        type: "steps",
        icon: "FileText",
        serviceKey: "renew_iqama",
        usageCount: 0,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: "default-2",
        userId: null,
        title: "Traffic Violations Check",
        titleAr: "الاستعلام عن المخالفات",
        type: "flow",
        icon: "Car",
        serviceKey: "check_violations",
        usageCount: 0,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: "default-3",
        userId: null,
        title: "Bank Account Requirements",
        titleAr: "متطلبات فتح حساب بنكي",
        type: "requirements",
        icon: "CreditCard",
        serviceKey: "bank_account",
        usageCount: 0,
        createdAt: null,
        updatedAt: null,
      },
      {
        id: "default-4",
        userId: null,
        title: "Vehicle Registration Renewal",
        titleAr: "تجديد الاستمارة",
        type: "steps",
        icon: "Car",
        serviceKey: "renew_vehicle",
        usageCount: 0,
        createdAt: null,
        updatedAt: null,
      },
    ];
  }

  async getUserDevices(userId: string): Promise<UserDevice[]> {
    return db
      .select()
      .from(userDevices)
      .where(eq(userDevices.userId, userId))
      .orderBy(desc(userDevices.lastSeen));
  }

  async getDeviceByUserAgent(userId: string, userAgent: string): Promise<UserDevice | undefined> {
    const [device] = await db
      .select()
      .from(userDevices)
      .where(and(eq(userDevices.userId, userId), eq(userDevices.userAgent, userAgent)));
    return device || undefined;
  }

  async createUserDevice(device: InsertUserDevice): Promise<UserDevice> {
    const [created] = await db
      .insert(userDevices)
      .values(device)
      .returning();
    return created;
  }

  async updateDeviceLastSeen(id: string): Promise<UserDevice | undefined> {
    const [updated] = await db
      .update(userDevices)
      .set({ lastSeen: new Date() })
      .where(eq(userDevices.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteUserDevice(id: string): Promise<void> {
    await db.delete(userDevices).where(eq(userDevices.id, id));
  }

  private generateTicketNumber(): string {
    const prefix = "DLN";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async getAllTickets(): Promise<SupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .orderBy(desc(supportTickets.createdAt));
  }

  async getTicketsByEmail(email: string): Promise<SupportTicket[]> {
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.userEmail, email.toLowerCase()))
      .orderBy(desc(supportTickets.createdAt));
  }

  async getTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.ticketNumber, ticketNumber));
    return ticket || undefined;
  }

  async getTicketById(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async createTicket(data: InsertSupportTicket): Promise<SupportTicket> {
    const ticketNumber = this.generateTicketNumber();
    const initialTimeline = [{
      action: "Ticket created",
      actionAr: "تم إنشاء التذكرة",
      timestamp: new Date().toISOString(),
      actor: "System",
    }];

    const [ticket] = await db
      .insert(supportTickets)
      .values({
        ...data,
        ticketNumber,
        userEmail: data.userEmail.toLowerCase(),
        status: "NEW",
        timeline: initialTimeline,
      })
      .returning();
    return ticket;
  }

  async updateTicketStatus(id: string, status: TicketStatus, actorName: string): Promise<SupportTicket | undefined> {
    const ticket = await this.getTicketById(id);
    if (!ticket) return undefined;

    const statusLabels: Record<TicketStatus, { en: string; ar: string }> = {
      NEW: { en: "Status changed to New", ar: "تم تغيير الحالة إلى جديد" },
      IN_REVIEW: { en: "Status changed to In Review", ar: "تم تغيير الحالة إلى قيد المراجعة" },
      RESOLVED: { en: "Status changed to Resolved", ar: "تم تغيير الحالة إلى تم الحل" },
      REQUIRES_OFFICIAL_CONTACT: { en: "Status changed to Requires Official Contact", ar: "تم تغيير الحالة إلى يتطلب التواصل الرسمي" },
    };

    const newTimelineEntry = {
      action: statusLabels[status].en,
      actionAr: statusLabels[status].ar,
      timestamp: new Date().toISOString(),
      actor: actorName,
    };

    const currentTimeline = (ticket.timeline as any[]) || [];

    const [updated] = await db
      .update(supportTickets)
      .set({
        status,
        timeline: [...currentTimeline, newTimelineEntry],
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updated || undefined;
  }

  async updateTicketAiSolution(id: string, aiSolution: SupportTicket["aiSolution"]): Promise<SupportTicket | undefined> {
    const ticket = await this.getTicketById(id);
    if (!ticket) return undefined;

    const newTimelineEntry = {
      action: "AI analysis completed",
      actionAr: "تم اكتمال التحليل الذكي",
      timestamp: new Date().toISOString(),
      actor: "AI Assistant",
    };

    const currentTimeline = (ticket.timeline as any[]) || [];

    const [updated] = await db
      .update(supportTickets)
      .set({
        aiSolution,
        timeline: [...currentTimeline, newTimelineEntry],
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updated || undefined;
  }

  async updateTicketAdminNotes(id: string, notes: string): Promise<SupportTicket | undefined> {
    const [updated] = await db
      .update(supportTickets)
      .set({
        adminNotes: notes,
        updatedAt: new Date(),
      })
      .where(eq(supportTickets.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteTicket(id: string): Promise<void> {
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
  }

  async getTicketComments(ticketId: string): Promise<TicketComment[]> {
    return db
      .select()
      .from(ticketComments)
      .where(eq(ticketComments.ticketId, ticketId))
      .orderBy(ticketComments.createdAt);
  }

  async addTicketComment(comment: InsertTicketComment): Promise<TicketComment> {
    const [created] = await db
      .insert(ticketComments)
      .values(comment)
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
