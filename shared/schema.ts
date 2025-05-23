import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  originalFilename: text("original_filename").notNull(),
  originalContent: text("original_content").notNull(),
  fileType: text("file_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const jobDescriptions = pgTable("job_descriptions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const optimizations = pgTable("optimizations", {
  id: serial("id").primaryKey(),
  resumeId: integer("resume_id").references(() => resumes.id).notNull(),
  jobDescriptionId: integer("job_description_id").references(() => jobDescriptions.id).notNull(),
  optimizedContent: text("optimized_content").notNull(),
  improvements: jsonb("improvements").notNull(),
  matchScore: integer("match_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertResumeSchema = createInsertSchema(resumes).omit({
  id: true,
  uploadedAt: true,
});

export const insertJobDescriptionSchema = createInsertSchema(jobDescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertOptimizationSchema = createInsertSchema(optimizations).omit({
  id: true,
  createdAt: true,
});

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type InsertJobDescription = z.infer<typeof insertJobDescriptionSchema>;
export type InsertOptimization = z.infer<typeof insertOptimizationSchema>;

export type Resume = typeof resumes.$inferSelect;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type Optimization = typeof optimizations.$inferSelect;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// API Response Types
export const optimizationRequestSchema = z.object({
  resumeContent: z.string().min(1, "Resume content is required"),
  jobDescription: z.string().min(1, "Job description is required"),
  filename: z.string().min(1, "Filename is required"),
  fileType: z.string().min(1, "File type is required"),
});

export type OptimizationRequest = z.infer<typeof optimizationRequestSchema>;

export const optimizationResponseSchema = z.object({
  optimizedContent: z.string(),
  improvements: z.object({
    matchScore: z.number(),
    keywordsAdded: z.number(),
    sectionsImproved: z.number(),
    improvementsList: z.array(z.string()),
  }),
  originalContent: z.string(),
});

export type OptimizationResponse = z.infer<typeof optimizationResponseSchema>;
