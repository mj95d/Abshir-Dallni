import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateChatResponse, type ChatRequest } from "./openai";
import { insertSavedInquirySchema, insertBreachMonitorSchema, insertChatMessageSchema } from "@shared/schema";
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
      if (data.error) {
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

  return httpServer;
}
