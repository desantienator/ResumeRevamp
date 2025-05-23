import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface ResumeAnalysis {
  experienceLevel: string;
  skillCount: number;
  industry: string;
  keySkills: string[];
}

export interface JobAnalysis {
  requiredSkills: string[];
  experienceLevel: string;
  industry: string;
  keyRequirements: string[];
}

export interface OptimizationResult {
  optimizedContent: string;
  improvements: {
    matchScore: number;
    keywordsAdded: number;
    sectionsImproved: number;
    improvementsList: string[];
  };
}

export async function analyzeResume(resumeContent: string): Promise<ResumeAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional resume analyzer. Analyze the resume content and provide structured analysis. Respond with JSON in this format: { 'experienceLevel': string, 'skillCount': number, 'industry': string, 'keySkills': string[] }",
        },
        {
          role: "user",
          content: `Analyze this resume content and extract key information:\n\n${resumeContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      experienceLevel: result.experienceLevel || "Entry Level",
      skillCount: result.skillCount || 0,
      industry: result.industry || "General",
      keySkills: result.keySkills || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze resume: " + (error as Error).message);
  }
}

export async function analyzeJobDescription(jobContent: string): Promise<JobAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a job description analyzer. Extract key requirements and skills from job descriptions. Respond with JSON in this format: { 'requiredSkills': string[], 'experienceLevel': string, 'industry': string, 'keyRequirements': string[] }",
        },
        {
          role: "user",
          content: `Analyze this job description and extract key requirements:\n\n${jobContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      requiredSkills: result.requiredSkills || [],
      experienceLevel: result.experienceLevel || "Entry Level",
      industry: result.industry || "General",
      keyRequirements: result.keyRequirements || [],
    };
  } catch (error) {
    throw new Error("Failed to analyze job description: " + (error as Error).message);
  }
}

export async function optimizeResume(
  resumeContent: string,
  jobDescription: string
): Promise<OptimizationResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume optimizer. Your task is to optimize a resume to better match a specific job description while maintaining truthfulness and professionalism. 

Guidelines:
1. Keep all factual information accurate - don't fabricate experience or skills
2. Enhance descriptions to highlight relevant experience and skills
3. Add relevant keywords from the job description where appropriate
4. Improve formatting and structure if needed
5. Quantify achievements where possible
6. Focus on accomplishments that match job requirements

Respond with JSON in this format: 
{
  "optimizedContent": "full optimized resume text",
  "improvements": {
    "matchScore": number (0-100),
    "keywordsAdded": number,
    "sectionsImproved": number,
    "improvementsList": ["improvement 1", "improvement 2", ...]
  }
}`,
        },
        {
          role: "user",
          content: `Please optimize this resume to better match the job description:

RESUME CONTENT:
${resumeContent}

JOB DESCRIPTION:
${jobDescription}

Please optimize the resume while maintaining accuracy and professionalism.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      optimizedContent: result.optimizedContent || resumeContent,
      improvements: {
        matchScore: Math.min(100, Math.max(0, result.improvements?.matchScore || 50)),
        keywordsAdded: Math.max(0, result.improvements?.keywordsAdded || 0),
        sectionsImproved: Math.max(0, result.improvements?.sectionsImproved || 0),
        improvementsList: result.improvements?.improvementsList || [],
      },
    };
  } catch (error) {
    throw new Error("Failed to optimize resume: " + (error as Error).message);
  }
}
