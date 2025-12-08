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
