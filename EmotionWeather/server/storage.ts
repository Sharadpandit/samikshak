import { type User, type InsertUser, type Policy, type InsertPolicy, type Vote, type InsertVote, type Comment, type InsertComment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Policy methods
  getPolicies(): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy | undefined>;
  deletePolicy(id: string): Promise<boolean>;
  
  // Vote methods
  getVotes(): Promise<Vote[]>;
  getVotesByPolicy(policyId: string): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  getVoteStats(policyId: string): Promise<{ [key: string]: number }>;
  
  // Comment methods
  getComments(): Promise<Comment[]>;
  getCommentsByPolicy(policyId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private policies: Map<string, Policy>;
  private votes: Map<string, Vote>;
  private comments: Map<string, Comment>;

  constructor() {
    this.users = new Map();
    this.policies = new Map();
    this.votes = new Map();
    this.comments = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const samplePolicy: Policy = {
      id: "policy-1",
      title: "Climate Action Initiative 2024",
      description: "A comprehensive policy proposal aimed at reducing carbon emissions by 50% over the next decade through renewable energy investments and sustainable transportation initiatives.",
      details: JSON.stringify({
        objectives: [
          "Implement renewable energy infrastructure in all government buildings",
          "Expand public transportation networks by 30%",
          "Provide tax incentives for electric vehicle adoption",
          "Establish community solar programs"
        ],
        timeline: "Implementation period: January 2024 - December 2034 (10 years)",
        budget: "Total investment: $2.4 billion over 10 years"
      }),
      status: "active",
      createdAt: new Date(),
    };

    const otherPolicies: Policy[] = [
      {
        id: "policy-2",
        title: "Education Reform Act",
        description: "Modernizing curriculum and increasing teacher funding across all districts",
        details: "{}",
        status: "draft",
        createdAt: new Date(),
      },
      {
        id: "policy-3",
        title: "Healthcare Accessibility",
        description: "Expanding healthcare coverage to underserved communities",
        details: "{}",
        status: "under_review",
        createdAt: new Date(),
      },
      {
        id: "policy-4",
        title: "Digital Infrastructure",
        description: "Improving internet connectivity in rural areas",
        details: "{}",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: "policy-5",
        title: "Small Business Support",
        description: "Tax breaks and grants for local entrepreneurs",
        details: "{}",
        status: "active",
        createdAt: new Date(),
      },
      {
        id: "policy-6",
        title: "Urban Development",
        description: "Sustainable city planning and affordable housing",
        details: "{}",
        status: "draft",
        createdAt: new Date(),
      }
    ];

    this.policies.set(samplePolicy.id, samplePolicy);
    otherPolicies.forEach(policy => this.policies.set(policy.id, policy));

    // Add sample votes for the main policy
    const sampleVotes: Vote[] = [
      { id: "vote-1", policyId: "policy-1", voteType: "happy", comment: null, createdAt: new Date() },
      { id: "vote-2", policyId: "policy-1", voteType: "happy", comment: null, createdAt: new Date() },
      { id: "vote-3", policyId: "policy-1", voteType: "angry", comment: null, createdAt: new Date() },
      { id: "vote-4", policyId: "policy-1", voteType: "neutral", comment: null, createdAt: new Date() },
      { id: "vote-5", policyId: "policy-1", voteType: "suggestion", comment: null, createdAt: new Date() },
    ];

    sampleVotes.forEach(vote => this.votes.set(vote.id, vote));
    
    // Add sample comments
    const sampleComments: Comment[] = [
      { 
        id: "comment-1", 
        policyId: "policy-1", 
        content: "This is exactly what we need! The renewable energy focus will create so many jobs in our community.", 
        author: "Sarah M.", 
        sentiment: "positive",
        createdAt: new Date() 
      },
      { 
        id: "comment-2", 
        policyId: "policy-1", 
        content: "I'm concerned about the cost. $2.4 billion seems like a lot when we have other pressing issues.", 
        author: "Mike T.", 
        sentiment: "negative",
        createdAt: new Date() 
      },
      { 
        id: "comment-3", 
        policyId: "policy-1", 
        content: "Why not include nuclear energy as part of the clean energy mix? It's reliable and carbon-free.", 
        author: "Dr. Kumar", 
        sentiment: "suggestion",
        createdAt: new Date() 
      },
      { 
        id: "comment-4", 
        policyId: "policy-1", 
        content: "The 10-year timeline is reasonable, but we need more details on the implementation phases.", 
        author: "Anonymous", 
        sentiment: "neutral",
        createdAt: new Date() 
      },
      { 
        id: "comment-5", 
        policyId: "policy-1", 
        content: "Love the community solar programs! This will help low-income families access clean energy.", 
        author: "Lisa R.", 
        sentiment: "positive",
        createdAt: new Date() 
      },
    ];

    sampleComments.forEach(comment => this.comments.set(comment.id, comment));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Policy methods
  async getPolicies(): Promise<Policy[]> {
    return Array.from(this.policies.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPolicy(id: string): Promise<Policy | undefined> {
    return this.policies.get(id);
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const id = randomUUID();
    const policy: Policy = { 
      ...insertPolicy, 
      id, 
      createdAt: new Date() 
    };
    this.policies.set(id, policy);
    return policy;
  }

  async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy | undefined> {
    const existingPolicy = this.policies.get(id);
    if (!existingPolicy) return undefined;
    
    const updatedPolicy = { ...existingPolicy, ...updates };
    this.policies.set(id, updatedPolicy);
    return updatedPolicy;
  }

  async deletePolicy(id: string): Promise<boolean> {
    return this.policies.delete(id);
  }

  // Vote methods
  async getVotes(): Promise<Vote[]> {
    return Array.from(this.votes.values());
  }

  async getVotesByPolicy(policyId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(vote => vote.policyId === policyId);
  }

  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = randomUUID();
    const vote: Vote = { 
      ...insertVote, 
      id, 
      createdAt: new Date() 
    };
    this.votes.set(id, vote);
    return vote;
  }

  async getVoteStats(policyId: string): Promise<{ [key: string]: number }> {
    const votes = await this.getVotesByPolicy(policyId);
    const stats = {
      happy: 0,
      angry: 0,
      neutral: 0,
      suggestion: 0,
    };

    votes.forEach(vote => {
      if (stats.hasOwnProperty(vote.voteType)) {
        stats[vote.voteType as keyof typeof stats]++;
      }
    });

    return stats;
  }

  // Comment methods
  async getComments(): Promise<Comment[]> {
    return Array.from(this.comments.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCommentsByPolicy(policyId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.policyId === policyId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = { 
      ...insertComment, 
      id,
      sentiment: "neutral", // Will be updated by AI later
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }
}

export const storage = new MemStorage();
