import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileText, X, CheckCircle } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  onUploadSuccess?: (result: any) => void;
  onUploadError?: (error: string) => void;
}

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const { uploadFile, uploadedFile, isUploading, removeFile } = useFileUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    try {
      const result = await uploadFile(file);
      onUploadSuccess?.(result);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : "Upload failed");
    }
  }, [uploadFile, onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemoveFile = () => {
    removeFile();
  };

  if (uploadedFile) {
    return (
      <div className="space-y-4">
        {/* Uploaded File Display */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="text-green-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">{uploadedFile.filename}</p>
                <p className="text-xs text-green-600">{uploadedFile.fileType}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-green-600 hover:text-green-700"
            >
              <X size={16} />
            </Button>
          </div>
        </Card>

        {/* File Analysis */}
        {uploadedFile.analysis && (
          <Card className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={16} />
              Resume Analysis
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Experience Level:</span>
                <span className="font-medium text-gray-900">{uploadedFile.analysis.experienceLevel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Key Skills Found:</span>
                <span className="font-medium text-gray-900">{uploadedFile.analysis.skillCount} skills</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Industry Focus:</span>
                <span className="font-medium text-gray-900">{uploadedFile.analysis.industry}</span>
              </div>
              {uploadedFile.analysis.keySkills.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">Key Skills Detected:</p>
                  <div className="flex flex-wrap gap-1">
                    {uploadedFile.analysis.keySkills.slice(0, 8).map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`upload-zone border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
        isDragActive 
          ? 'border-primary bg-primary/5 drag-over' 
          : 'border-gray-300 hover:border-primary/50'
      } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          ) : (
            <CloudUpload className="text-primary" size={32} />
          )}
        </div>
        
        <div>
          {isUploading ? (
            <>
              <p className="text-lg font-medium text-gray-900">Processing your resume...</p>
              <p className="text-sm text-gray-600">Please wait while we analyze your file</p>
            </>
          ) : isDragActive ? (
            <>
              <p className="text-lg font-medium text-gray-900">Drop your resume here</p>
              <p className="text-sm text-gray-600">Release to upload</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-900">Drop your resume here</p>
              <p className="text-sm text-gray-600">or click to browse files</p>
            </>
          )}
        </div>
        
        <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX, TXT (Max 10MB)</p>
      </div>
    </div>
  );
}
