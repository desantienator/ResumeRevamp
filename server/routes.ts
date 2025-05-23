import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  optimizationRequestSchema,
  insertJobDescriptionSchema,
  insertResumeSchema
} from "@shared/schema";
import { upload, extractTextFromFile, getFileType } from "./fileProcessor";
import { analyzeResume, analyzeJobDescription, optimizeResume } from "./openai";
import { generateDocxFromContent } from "./documentGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // File upload endpoint
  app.post("/api/upload", upload.single("resume"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { buffer, mimetype, originalname } = req.file;
      
      // Extract text content from the uploaded file
      const textContent = await extractTextFromFile(buffer, mimetype, originalname);
      
      if (!textContent.trim()) {
        return res.status(400).json({ error: "Unable to extract text from the uploaded file" });
      }

      // Store the resume
      const resumeData = {
        originalFilename: originalname,
        originalContent: textContent,
        fileType: getFileType(mimetype),
      };

      const validatedData = insertResumeSchema.parse(resumeData);
      const resume = await storage.createResume(validatedData);
      
      // Analyze the resume
      const analysis = await analyzeResume(textContent);
      
      res.json({
        resumeId: resume.id,
        filename: originalname,
        fileType: resume.fileType,
        analysis: analysis,
        success: true
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process uploaded file" 
      });
    }
  });

  // Job description analysis endpoint
  app.post("/api/analyze-job", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: "Job description content is required" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ error: "Job description is too long (max 5000 characters)" });
      }

      // Store job description
      const jobDescriptionData = {
        content: content.trim(),
      };

      const validatedData = insertJobDescriptionSchema.parse(jobDescriptionData);
      
      // Analyze job description
      const analysis = await analyzeJobDescription(content);
      
      // Store with analysis
      const jobDescription = await storage.createJobDescription({
        ...validatedData,
        analysis: analysis
      });

      res.json({
        jobDescriptionId: jobDescription.id,
        analysis: analysis,
        success: true
      });

    } catch (error) {
      console.error("Job analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to analyze job description" 
      });
    }
  });

  // Resume optimization endpoint
  app.post("/api/optimize", async (req, res) => {
    try {
      const { resumeId, jobDescriptionId } = req.body;
      
      if (!resumeId || !jobDescriptionId) {
        return res.status(400).json({ error: "Resume ID and Job Description ID are required" });
      }

      // Fetch resume and job description
      const resume = await storage.getResume(resumeId);
      const jobDescription = await storage.getJobDescription(jobDescriptionId);

      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      if (!jobDescription) {
        return res.status(404).json({ error: "Job description not found" });
      }

      // Optimize resume using OpenAI
      const optimization = await optimizeResume(resume.originalContent, jobDescription.content);
      
      // Store optimization result
      const optimizationData = {
        resumeId: resume.id,
        jobDescriptionId: jobDescription.id,
        optimizedContent: optimization.optimizedContent,
        improvements: optimization.improvements,
        matchScore: optimization.improvements.matchScore,
      };

      const savedOptimization = await storage.createOptimization(optimizationData);

      res.json({
        optimizationId: savedOptimization.id,
        originalContent: resume.originalContent,
        optimizedContent: optimization.optimizedContent,
        improvements: optimization.improvements,
        success: true
      });

    } catch (error) {
      console.error("Optimization error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to optimize resume" 
      });
    }
  });

  // Download optimized resume endpoint
  app.get("/api/download/:optimizationId", async (req, res) => {
    try {
      const { optimizationId } = req.params;
      
      const optimization = await storage.getOptimization(parseInt(optimizationId));
      
      if (!optimization) {
        return res.status(404).json({ error: "Optimization not found" });
      }

      const resume = await storage.getResume(optimization.resumeId);
      
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      // Generate DOCX file
      const docxBuffer = await generateDocxFromContent(
        optimization.optimizedContent,
        resume.originalFilename
      );

      // Set headers for file download
      const filename = `optimized_${resume.originalFilename.replace(/\.[^/.]+$/, "")}.docx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', docxBuffer.length);
      
      res.send(docxBuffer);

    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to generate download" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
