import multer from "multer";
import * as mammoth from "mammoth";
import { Request } from "express";

// Configure multer for file uploads
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: any, cb: multer.FileFilterCallback) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

export async function extractTextFromFile(
  buffer: Buffer,
  mimetype: string,
  filename: string
): Promise<string> {
  try {
    switch (mimetype) {
      case 'application/pdf':
        // Dynamically import pdf-parse to avoid startup issues
        const pdfParse = await import('pdf-parse');
        const pdfData = await (pdfParse as any).default(buffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer });
        return docxResult.value;
      
      case 'application/msword':
        // For legacy .doc files, we'll try mammoth as well
        try {
          const docResult = await mammoth.extractRawText({ buffer });
          return docResult.value;
        } catch (error) {
          throw new Error('Unable to process legacy DOC file. Please convert to DOCX format.');
        }
      
      case 'text/plain':
        return buffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${mimetype}`);
    }
  } catch (error) {
    throw new Error(`Failed to extract text from ${filename}: ${(error as Error).message}`);
  }
}

export function getFileType(mimetype: string): string {
  switch (mimetype) {
    case 'application/pdf':
      return 'PDF';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'application/msword':
      return 'DOC';
    case 'text/plain':
      return 'TXT';
    default:
      return 'Unknown';
  }
}

export function validateFileSize(size: number): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return size <= maxSize;
}
