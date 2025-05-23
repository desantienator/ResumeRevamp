import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

interface UploadedFile {
  resumeId: number;
  filename: string;
  fileType: string;
  analysis: {
    experienceLevel: string;
    skillCount: number;
    industry: string;
    keySkills: string[];
  };
}

export function useFileUpload() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFile(data);
    },
  });

  const uploadFile = async (file: File) => {
    return uploadMutation.mutateAsync(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    uploadMutation.reset();
  };

  return {
    uploadFile,
    uploadedFile,
    isUploading: uploadMutation.isPending,
    removeFile,
    resetUpload,
    error: uploadMutation.error,
  };
}
