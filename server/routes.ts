import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, type ChatRequest } from "./openai";
import { insertSavedInquirySchema, insertBreachMonitorSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

const HIBP_API_URL = "https://haveibeenpwned.com/api/v3";
const APP_NAME = "Dalleni-SaudiGovAssistant";

interface HIBPBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
  IsStealerLog: boolean;
  IsSubscriptionFree: boolean;
}

async function checkHIBPBreaches(email: string): Promise<{
  found: boolean;
  breaches?: {
    name: string;
    date: string;
    dataTypes: string[];
    severity: "high" | "medium" | "low";
  }[];
}> {
  const hibpApiKey = process.env.HIBP_API_KEY;
  
  if (!hibpApiKey) {
    throw new Error("HIBP API key not configured");
  }

  try {
    const response = await fetch(
      `${HIBP_API_URL}/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          "hibp-api-key": hibpApiKey,
          "user-agent": APP_NAME,
        },
      }
    );

    if (response.status === 404) {
      return { found: false };
    }

    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.status}`);
    }

    const breaches: HIBPBreach[] = await response.json();

    const formattedBreaches = breaches.map((breach) => {
      let severity: "high" | "medium" | "low" = "low";
      
      const sensitiveDataTypes = ["Passwords", "Credit cards", "Bank account numbers", "Social security numbers"];
      const hasSensitiveData = breach.DataClasses.some((dc) => sensitiveDataTypes.includes(dc));
      
      if (hasSensitiveData || breach.PwnCount > 10000000) {
        severity = "high";
      } else if (breach.DataClasses.includes("Email addresses") || breach.PwnCount > 1000000) {
        severity = "medium";
      }

      return {
        name: breach.Title,
        date: breach.BreachDate,
        dataTypes: breach.DataClasses.map((dc) => dc.toLowerCase().replace(" ", "_")),
        severity,
      };
    });

    return {
      found: true,
      breaches: formattedBreaches,
    };
  } catch (error) {
    console.error("HIBP API error:", error);
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

      const result = await checkHIBPBreaches(email);

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

  return httpServer;
}
