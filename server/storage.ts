import { 
  resumes, 
  jobDescriptions, 
  optimizations,
  users,
  type Resume, 
  type JobDescription, 
  type Optimization,
  type User,
  type InsertResume, 
  type InsertJobDescription, 
  type InsertOptimization,
  type InsertUser
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResume(id: number): Promise<Resume | undefined>;
  
  // Job description operations
  createJobDescription(jobDescription: InsertJobDescription): Promise<JobDescription>;
  getJobDescription(id: number): Promise<JobDescription | undefined>;
  
  // Optimization operations
  createOptimization(optimization: InsertOptimization): Promise<Optimization>;
  getOptimization(id: number): Promise<Optimization | undefined>;
  getOptimizationsByResumeId(resumeId: number): Promise<Optimization[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private jobDescriptions: Map<number, JobDescription>;
  private optimizations: Map<number, Optimization>;
  private currentUserId: number;
  private currentResumeId: number;
  private currentJobDescriptionId: number;
  private currentOptimizationId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.jobDescriptions = new Map();
    this.optimizations = new Map();
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentJobDescriptionId = 1;
    this.currentOptimizationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const resume: Resume = { 
      ...insertResume, 
      id,
      uploadedAt: new Date()
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResume(id: number): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async createJobDescription(insertJobDescription: InsertJobDescription): Promise<JobDescription> {
    const id = this.currentJobDescriptionId++;
    const jobDescription: JobDescription = {
      ...insertJobDescription,
      id,
      analysis: insertJobDescription.analysis || null,
      createdAt: new Date()
    };
    this.jobDescriptions.set(id, jobDescription);
    return jobDescription;
  }

  async getJobDescription(id: number): Promise<JobDescription | undefined> {
    return this.jobDescriptions.get(id);
  }

  async createOptimization(insertOptimization: InsertOptimization): Promise<Optimization> {
    const id = this.currentOptimizationId++;
    const optimization: Optimization = {
      ...insertOptimization,
      id,
      createdAt: new Date()
    };
    this.optimizations.set(id, optimization);
    return optimization;
  }

  async getOptimization(id: number): Promise<Optimization | undefined> {
    return this.optimizations.get(id);
  }

  async getOptimizationsByResumeId(resumeId: number): Promise<Optimization[]> {
    return Array.from(this.optimizations.values()).filter(
      (optimization) => optimization.resumeId === resumeId
    );
  }
}

export const storage = new MemStorage();
