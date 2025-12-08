import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  savedInquiries: many(savedInquiries),
  breachMonitors: many(breachMonitors),
  chatMessages: many(chatMessages),
}));

export const savedInquiries = pgTable("saved_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  serviceType: text("service_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedInquiriesRelations = relations(savedInquiries, ({ one }) => ({
  user: one(users, {
    fields: [savedInquiries.userId],
    references: [users.id],
  }),
}));

export const breachMonitors = pgTable("breach_monitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  email: text("email").notNull(),
  lastChecked: timestamp("last_checked"),
  breachCount: integer("breach_count").default(0),
  breachDetails: jsonb("breach_details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const breachMonitorsRelations = relations(breachMonitors, ({ one }) => ({
  user: one(users, {
    fields: [breachMonitors.userId],
    references: [users.id],
  }),
}));

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  preferredLanguage: true,
});

export const insertSavedInquirySchema = createInsertSchema(savedInquiries).pick({
  userId: true,
  title: true,
  content: true,
  serviceType: true,
});

export const insertBreachMonitorSchema = createInsertSchema(breachMonitors).pick({
  userId: true,
  email: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  sessionId: true,
  role: true,
  content: true,
});

export const shieldUsers = pgTable("shield_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  consent: boolean("consent").notNull().default(true),
  notifyChannel: text("notify_channel").default("email"),
  locale: text("locale").default("ar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shieldBreaches = pgTable("shield_breaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  source: text("source").notNull(),
  breachName: text("breach_name"),
  breachDate: text("breach_date"),
  record: jsonb("record"),
  seenAt: timestamp("seen_at").defaultNow(),
});

export const shieldNotifications = pgTable("shield_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  kind: text("kind").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertShieldUserSchema = createInsertSchema(shieldUsers).pick({
  email: true,
  phone: true,
  consent: true,
  notifyChannel: true,
  locale: true,
});

export const insertShieldBreachSchema = createInsertSchema(shieldBreaches).pick({
  email: true,
  source: true,
  breachName: true,
  breachDate: true,
  record: true,
});

export const insertShieldNotificationSchema = createInsertSchema(shieldNotifications).pick({
  email: true,
  kind: true,
  message: true,
});

export const savedQueries = pgTable("saved_queries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull(),
  type: text("type").notNull(),
  icon: text("icon").default("FileText"),
  serviceKey: text("service_key").notNull(),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const savedQueriesRelations = relations(savedQueries, ({ one }) => ({
  user: one(users, {
    fields: [savedQueries.userId],
    references: [users.id],
  }),
}));

export const userDevices = pgTable("user_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  device: text("device").notNull(),
  os: text("os").notNull(),
  browser: text("browser").notNull(),
  userAgent: text("user_agent").notNull(),
  screen: text("screen"),
  theme: text("theme"),
  lang: text("lang"),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));

export const insertSavedQuerySchema = createInsertSchema(savedQueries).pick({
  userId: true,
  title: true,
  titleAr: true,
  type: true,
  icon: true,
  serviceKey: true,
});

export const insertUserDeviceSchema = createInsertSchema(userDevices).pick({
  userId: true,
  device: true,
  os: true,
  browser: true,
  userAgent: true,
  screen: true,
  theme: true,
  lang: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSavedInquiry = z.infer<typeof insertSavedInquirySchema>;
export type SavedInquiry = typeof savedInquiries.$inferSelect;
export type InsertBreachMonitor = z.infer<typeof insertBreachMonitorSchema>;
export type BreachMonitor = typeof breachMonitors.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertShieldUser = z.infer<typeof insertShieldUserSchema>;
export type ShieldUser = typeof shieldUsers.$inferSelect;
export type InsertShieldBreach = z.infer<typeof insertShieldBreachSchema>;
export type ShieldBreach = typeof shieldBreaches.$inferSelect;
export type InsertShieldNotification = z.infer<typeof insertShieldNotificationSchema>;
export type ShieldNotification = typeof shieldNotifications.$inferSelect;
export type InsertSavedQuery = z.infer<typeof insertSavedQuerySchema>;
export type SavedQuery = typeof savedQueries.$inferSelect;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
export type UserDevice = typeof userDevices.$inferSelect;

export const ticketStatusEnum = ["NEW", "IN_REVIEW", "RESOLVED", "REQUIRES_OFFICIAL_CONTACT"] as const;
export type TicketStatus = typeof ticketStatusEnum[number];

export const serviceTypeEnum = [
  "iqama",
  "vehicle_transfer",
  "vehicle_renewal",
  "reports",
  "appointments",
  "baladi",
  "traffic",
  "other"
] as const;
export type ServiceType = typeof serviceTypeEnum[number];

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  serviceType: text("service_type").notNull(),
  issueDescription: text("issue_description").notNull(),
  userEmail: text("user_email").notNull(),
  userPhone: text("user_phone"),
  nationalId: text("national_id"),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  status: text("status").notNull().default("NEW"),
  aiSolution: jsonb("ai_solution").$type<{
    explanation: string;
    explanationAr: string;
    steps: { en: string; ar: string }[];
    documents: { en: string; ar: string }[];
    officialLinks: { name: string; url: string }[];
    recommendation: string;
    recommendationAr: string;
    canBeSolvedOnline: boolean;
    requiresBranch: boolean;
  } | null>(),
  adminNotes: text("admin_notes"),
  timeline: jsonb("timeline").$type<{
    action: string;
    actionAr: string;
    timestamp: string;
    actor: string;
  }[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
}));

export const ticketComments = pgTable("ticket_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  isAdminComment: boolean("is_admin_comment").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketComments.ticketId],
    references: [supportTickets.id],
  }),
  author: one(users, {
    fields: [ticketComments.authorId],
    references: [users.id],
  }),
}));

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  userId: true,
  serviceType: true,
  issueDescription: true,
  userEmail: true,
  userPhone: true,
  nationalId: true,
  attachments: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).pick({
  ticketId: true,
  authorId: true,
  authorName: true,
  content: true,
  isAdminComment: true,
});

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;
export type TicketComment = typeof ticketComments.$inferSelect;
