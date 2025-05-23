import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface JobAnalysisResult {
  jobDescriptionId: number;
  analysis: {
    requiredSkills: string[];
    experienceLevel: string;
    industry: string;
    keyRequirements: string[];
  };
}

export function useJobDescription() {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (jobContent: string) => {
      const response = await fetch("/api/analyze-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: jobContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setLastSaved(new Date());
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze job description",
        variant: "destructive",
      });
    },
  });

  // Auto-save and analyze job description
  useEffect(() => {
    if (content.trim().length < 100) {
      setAnalysisResult(null);
      return;
    }

    const timer = setTimeout(() => {
      if (content.trim() && content.length >= 100) {
        analysisMutation.mutate(content);
      }
    }, 2000); // Wait 2 seconds after user stops typing

    return () => clearTimeout(timer);
  }, [content]);

  const resetContent = useCallback(() => {
    setContent("");
    setAnalysisResult(null);
    setLastSaved(null);
    analysisMutation.reset();
  }, []);

  return {
    content,
    setContent,
    analysisResult,
    isAnalyzing: analysisMutation.isPending,
    lastSaved,
    characterCount: content.length,
    resetContent,
  };
}
