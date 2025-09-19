import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPolicySchema, insertVoteSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all policies
  app.get("/api/policies", async (req, res) => {
    try {
      const policies = await storage.getPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policies" });
    }
  });

  // Get single policy
  app.get("/api/policies/:id", async (req, res) => {
    try {
      const policy = await storage.getPolicy(req.params.id);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch policy" });
    }
  });

  // Create new policy
  app.post("/api/policies", async (req, res) => {
    try {
      const validatedData = insertPolicySchema.parse(req.body);
      const policy = await storage.createPolicy(validatedData);
      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid policy data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create policy" });
    }
  });

  // Update policy
  app.put("/api/policies/:id", async (req, res) => {
    try {
      const updates = req.body;
      const policy = await storage.updatePolicy(req.params.id, updates);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ message: "Failed to update policy" });
    }
  });

  // Delete policy
  app.delete("/api/policies/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePolicy(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Policy not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete policy" });
    }
  });

  // Get votes for a policy
  app.get("/api/policies/:id/votes", async (req, res) => {
    try {
      const votes = await storage.getVotesByPolicy(req.params.id);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  // Get vote statistics for a policy
  app.get("/api/policies/:id/stats", async (req, res) => {
    try {
      const stats = await storage.getVoteStats(req.params.id);
      const total = Object.values(stats).reduce((sum, count) => sum + count, 0);
      
      const result = {
        stats,
        total,
        percentages: Object.fromEntries(
          Object.entries(stats).map(([type, count]) => [
            type, 
            total > 0 ? Math.round((count / total) * 100) : 0
          ])
        )
      };
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch vote statistics" });
    }
  });

  // Submit a vote
  app.post("/api/votes", async (req, res) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      const vote = await storage.createVote(validatedData);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid vote data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit vote" });
    }
  });

  // Get current active policy
  app.get("/api/current-policy", async (req, res) => {
    try {
      const policies = await storage.getPolicies();
      const activePolicy = policies.find(p => p.status === "active");
      if (!activePolicy) {
        return res.status(404).json({ message: "No active policy found" });
      }
      res.json(activePolicy);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current policy" });
    }
  });

  // Get comments for a policy
  app.get("/api/policies/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPolicy(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Submit a comment
  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit comment" });
    }
  });

  // Get all comments for AI summary
  app.get("/api/comments", async (req, res) => {
    try {
      const comments = await storage.getComments();
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
