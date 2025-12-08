import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, type ChatRequest } from "./openai";
import { insertSavedInquirySchema, insertBreachMonitorSchema, insertChatMessageSchema, insertShieldUserSchema, insertSavedQuerySchema, insertUserDeviceSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const LEAKCHECK_PUBLIC_API_URL = "https://leakcheck.io/api/public";

interface LeakCheckResponse {
  success: boolean;
  found: number;
  fields?: string[];
  sources?: {
    name: string;
    date: string;
  }[];
  error?: string;
}

async function checkLeakCheckBreaches(email: string): Promise<{
  found: boolean;
  breaches?: {
    name: string;
    date: string;
    dataTypes: string[];
    severity: "high" | "medium" | "low";
  }[];
}> {
  try {
    const response = await fetch(
      `${LEAKCHECK_PUBLIC_API_URL}?check=${encodeURIComponent(email)}`,
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LeakCheck API error: ${response.status}`);
    }

    const data: LeakCheckResponse = await response.json();

    if (!data.success) {
      if (data.error && data.error.toLowerCase() !== "not found") {
        throw new Error(`LeakCheck error: ${data.error}`);
      }
      return { found: false };
    }

    if (data.found === 0 || !data.sources || data.sources.length === 0) {
      return { found: false };
    }

    const sensitiveFields = ["password", "passwords", "phone", "address", "dob", "ssn"];
    const fields = data.fields || [];
    const hasSensitiveData = fields.some(f => sensitiveFields.includes(f.toLowerCase()));

    const formattedBreaches = data.sources.map((source) => {
      let severity: "high" | "medium" | "low" = "low";
      const lowerFields = fields.map(f => f.toLowerCase());
      
      if (hasSensitiveData) {
        severity = "high";
      } else if (lowerFields.includes("email") || lowerFields.includes("username")) {
        severity = "medium";
      }

      return {
        name: source.name,
        date: source.date,
        dataTypes: fields.map(f => f.toLowerCase().replace(" ", "_")),
        severity,
      };
    });

    return {
      found: true,
      breaches: formattedBreaches,
    };
  } catch (error) {
    console.error("LeakCheck API error:", error);
    throw error;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  const chatRequestSchema = z.object({
    message: z.string().min(1),
    language: z.enum(["en", "ar"]),
    sessionId: z.string().optional(),
    userId: z.string().optional(),
    conversationHistory: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })).optional(),
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const parsed = chatRequestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }

      const { message, language, sessionId, userId, conversationHistory } = parsed.data;

      const chatRequest: ChatRequest = {
        message,
        language,
        conversationHistory,
      };

      const response = await generateChatResponse(chatRequest);

      if (sessionId) {
        await storage.createChatMessage({
          sessionId,
          userId: userId || null,
          role: "user",
          content: message,
        });

        await storage.createChatMessage({
          sessionId,
          userId: userId || null,
          role: "assistant",
          content: response,
        });
      }

      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  const breachCheckSchema = z.object({
    email: z.string().email(),
    userId: z.string().optional(),
  });

  app.post("/api/breach-check", async (req, res) => {
    try {
      const parsed = breachCheckSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const { email, userId } = parsed.data;

      const result = await checkLeakCheckBreaches(email);

      if (userId) {
        const existingMonitor = await storage.getBreachMonitorByEmail(userId, email);
        
        if (existingMonitor) {
          await storage.updateBreachMonitor(existingMonitor.id, {
            lastChecked: new Date(),
            breachCount: result.breaches?.length || 0,
            breachDetails: result.breaches || [],
          });
        } else {
          await storage.createBreachMonitor({
            userId,
            email,
          });
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Breach check error:", error);
      res.status(500).json({ error: "Failed to check for breaches" });
    }
  });

  app.get("/api/inquiries/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const inquiries = await storage.getSavedInquiries(userId);
      res.json(inquiries);
    } catch (error) {
      console.error("Get inquiries error:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      const parsed = insertSavedInquirySchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }

      const inquiry = await storage.createSavedInquiry(parsed.data);
      res.status(201).json(inquiry);
    } catch (error) {
      console.error("Create inquiry error:", error);
      res.status(500).json({ error: "Failed to save inquiry" });
    }
  });

  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavedInquiry(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete inquiry error:", error);
      res.status(500).json({ error: "Failed to delete inquiry" });
    }
  });

  app.get("/api/breach-monitors/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const monitors = await storage.getBreachMonitors(userId);
      res.json(monitors);
    } catch (error) {
      console.error("Get breach monitors error:", error);
      res.status(500).json({ error: "Failed to fetch breach monitors" });
    }
  });

  app.get("/api/chat-history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  const shieldEmailSchema = z.object({
    email: z.string().email(),
  });

  const shieldSubscribeSchema = z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    consent: z.boolean(),
    notifyChannel: z.enum(["email", "sms", "both"]).optional(),
    locale: z.enum(["ar", "en"]).optional(),
  });

  app.post("/api/shield/subscribe", async (req, res) => {
    try {
      const parsed = shieldSubscribeSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }

      const { email, phone, consent, notifyChannel, locale } = parsed.data;

      if (!consent) {
        return res.status(400).json({ error: "Consent is required for monitoring" });
      }

      const existingUser = await storage.getShieldUserByEmail(email);
      
      if (existingUser) {
        const updated = await storage.updateShieldUser(email, {
          phone,
          consent,
          notifyChannel: notifyChannel || "email",
          locale: locale || "ar",
        });
        return res.json({ message: "Subscription updated", user: updated });
      }

      const user = await storage.createShieldUser({
        email,
        phone,
        consent,
        notifyChannel: notifyChannel || "email",
        locale: locale || "ar",
      });

      res.status(201).json({ message: "Subscribed successfully", user });
    } catch (error) {
      console.error("Shield subscribe error:", error);
      res.status(500).json({ error: "Failed to subscribe" });
    }
  });

  app.post("/api/shield/status", async (req, res) => {
    try {
      const parsed = shieldEmailSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const { email } = parsed.data;
      const user = await storage.getShieldUserByEmail(email);
      
      if (!user) {
        return res.json({ subscribed: false });
      }

      const breaches = await storage.getShieldBreachesByEmail(email);
      const notifications = await storage.getShieldNotificationsByEmail(email);

      res.json({
        subscribed: user.consent,
        user: {
          email: user.email,
          notifyChannel: user.notifyChannel,
          locale: user.locale,
          createdAt: user.createdAt,
        },
        breachCount: breaches.length,
        recentBreaches: breaches.slice(0, 5),
        notificationCount: notifications.length,
      });
    } catch (error) {
      console.error("Shield status error:", error);
      res.status(500).json({ error: "Failed to get status" });
    }
  });

  app.post("/api/shield/check", async (req, res) => {
    try {
      const parsed = shieldEmailSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const { email } = parsed.data;
      const result = await checkLeakCheckBreaches(email);

      if (result.found && result.breaches) {
        for (const breach of result.breaches) {
          const exists = await storage.hasExistingBreach(email, breach.name, "leakcheck");
          
          if (!exists) {
            await storage.createShieldBreach({
              email,
              source: "leakcheck",
              breachName: breach.name,
              breachDate: breach.date,
              record: {
                dataTypes: breach.dataTypes,
                severity: breach.severity,
              },
            });
          }
        }
      }

      const storedBreaches = await storage.getShieldBreachesByEmail(email);

      res.json({
        found: result.found,
        breaches: result.breaches,
        storedBreachCount: storedBreaches.length,
      });
    } catch (error) {
      console.error("Shield check error:", error);
      res.status(500).json({ error: "Failed to check for breaches" });
    }
  });

  app.post("/api/shield/unsubscribe", async (req, res) => {
    try {
      const parsed = shieldEmailSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const { email } = parsed.data;
      const user = await storage.getShieldUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateShieldUser(email, { consent: false });

      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Shield unsubscribe error:", error);
      res.status(500).json({ error: "Failed to unsubscribe" });
    }
  });

  app.post("/api/shield/delete", async (req, res) => {
    try {
      const parsed = shieldEmailSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid email address" });
      }

      const { email } = parsed.data;
      const user = await storage.getShieldUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.deleteShieldUser(email);

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Shield delete error:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.post("/api/shield/cron", async (req, res) => {
    try {
      const users = await storage.getAllConsentedShieldUsers();
      const results: { email: string; newBreaches: number }[] = [];

      for (const user of users) {
        try {
          const result = await checkLeakCheckBreaches(user.email);
          let newBreachCount = 0;

          if (result.found && result.breaches) {
            for (const breach of result.breaches) {
              const exists = await storage.hasExistingBreach(user.email, breach.name, "leakcheck");
              
              if (!exists) {
                await storage.createShieldBreach({
                  email: user.email,
                  source: "leakcheck",
                  breachName: breach.name,
                  breachDate: breach.date,
                  record: {
                    dataTypes: breach.dataTypes,
                    severity: breach.severity,
                  },
                });
                newBreachCount++;
              }
            }

            if (newBreachCount > 0) {
              const message = user.locale === "ar"
                ? `تم اكتشاف ${newBreachCount} تسريب(ات) جديدة لبريدك الإلكتروني. يرجى تغيير كلمات المرور فوراً.`
                : `${newBreachCount} new breach(es) detected for your email. Please change your passwords immediately.`;

              await storage.createShieldNotification({
                email: user.email,
                kind: "breach_alert",
                message,
              });
            }
          }

          results.push({ email: user.email, newBreaches: newBreachCount });
        } catch (userError) {
          console.error(`Error checking breaches for ${user.email}:`, userError);
        }
      }

      res.json({
        message: "Cron job completed",
        usersChecked: users.length,
        results,
      });
    } catch (error) {
      console.error("Shield cron error:", error);
      res.status(500).json({ error: "Failed to run cron job" });
    }
  });

  app.get("/api/saved-queries", async (req, res) => {
    try {
      const defaults = storage.getDefaultSavedQueries();
      res.json(defaults);
    } catch (error) {
      console.error("Get default saved queries error:", error);
      res.status(500).json({ error: "Failed to fetch saved queries" });
    }
  });

  app.get("/api/saved-queries/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userQueries = await storage.getSavedQueries(userId);
      const defaults = storage.getDefaultSavedQueries();
      const combined = [...userQueries, ...defaults.filter(d => 
        !userQueries.some(q => q.serviceKey === d.serviceKey)
      )];
      res.json(combined);
    } catch (error) {
      console.error("Get saved queries error:", error);
      res.status(500).json({ error: "Failed to fetch saved queries" });
    }
  });

  app.post("/api/saved-queries", async (req, res) => {
    try {
      const parsed = insertSavedQuerySchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }

      const existing = await storage.getSavedQueryByServiceKey(
        parsed.data.userId || "",
        parsed.data.serviceKey
      );

      if (existing) {
        return res.status(409).json({ error: "Query already saved" });
      }

      const query = await storage.createSavedQuery(parsed.data);
      res.status(201).json(query);
    } catch (error) {
      console.error("Create saved query error:", error);
      res.status(500).json({ error: "Failed to save query" });
    }
  });

  app.post("/api/saved-queries/:id/use", async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateSavedQueryUsage(id);
      res.json(updated);
    } catch (error) {
      console.error("Update saved query usage error:", error);
      res.status(500).json({ error: "Failed to update usage" });
    }
  });

  app.delete("/api/saved-queries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavedQuery(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete saved query error:", error);
      res.status(500).json({ error: "Failed to delete query" });
    }
  });

  const deviceUpdateSchema = z.object({
    userId: z.string().optional(),
    device: z.string(),
    os: z.string(),
    browser: z.string(),
    userAgent: z.string(),
    screen: z.string().optional(),
    theme: z.string().optional(),
    lang: z.string().optional(),
  });

  app.post("/api/device/update", async (req, res) => {
    try {
      const parsed = deviceUpdateSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      }

      const { userId, device, os, browser, userAgent, screen, theme, lang } = parsed.data;

      if (!userId) {
        return res.json({ 
          message: "Device info received (no user session)",
          device,
          os,
          browser,
          isNewDevice: false 
        });
      }

      const existingDevice = await storage.getDeviceByUserAgent(userId, userAgent);

      if (existingDevice) {
        await storage.updateDeviceLastSeen(existingDevice.id);
        return res.json({ 
          message: "Device updated", 
          device: existingDevice,
          isNewDevice: false 
        });
      }

      const userDevices = await storage.getUserDevices(userId);
      const isNewDevice = userDevices.length > 0;

      const newDevice = await storage.createUserDevice({
        userId,
        device,
        os,
        browser,
        userAgent,
        screen,
        theme,
        lang,
      });

      res.status(201).json({ 
        message: isNewDevice ? "New device detected" : "First device registered",
        device: newDevice,
        isNewDevice,
        previousDevices: isNewDevice ? userDevices.slice(0, 3).map(d => ({
          device: d.device,
          browser: d.browser,
          lastSeen: d.lastSeen
        })) : []
      });
    } catch (error) {
      console.error("Device update error:", error);
      res.status(500).json({ error: "Failed to update device" });
    }
  });

  app.get("/api/device/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const devices = await storage.getUserDevices(userId);
      res.json(devices);
    } catch (error) {
      console.error("Get devices error:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  app.get("/api/device/:userId/current", async (req, res) => {
    try {
      const { userId } = req.params;
      const devices = await storage.getUserDevices(userId);
      const current = devices[0];
      res.json(current || null);
    } catch (error) {
      console.error("Get current device error:", error);
      res.status(500).json({ error: "Failed to fetch current device" });
    }
  });

  app.delete("/api/device/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserDevice(id);
      res.status(204).send();
    } catch (error) {
      console.error("Delete device error:", error);
      res.status(500).json({ error: "Failed to delete device" });
    }
  });

  return httpServer;
}
