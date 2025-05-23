import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Briefcase, Sparkles, Download, HelpCircle } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import StepIndicator from "@/components/StepIndicator";
import ResultsSection from "@/components/ResultsSection";
import { useFileUpload } from "@/hooks/useFileUpload";
import { useJobDescription } from "@/hooks/useJobDescription";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { OptimizationResponse } from "@shared/schema";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResponse | null>(null);
  
  const { toast } = useToast();
  const fileUpload = useFileUpload();
  const jobDescription = useJobDescription();

  const optimizeMutation = useMutation({
    mutationFn: async () => {
      if (!fileUpload.uploadedFile?.resumeId || !jobDescription.analysisResult?.jobDescriptionId) {
        throw new Error("Please upload a resume and enter a job description first");
      }

      const response = await apiRequest("POST", "/api/optimize", {
        resumeId: fileUpload.uploadedFile.resumeId,
        jobDescriptionId: jobDescription.analysisResult.jobDescriptionId,
      });

      return response.json();
    },
    onSuccess: (data) => {
      setOptimizationResult(data);
      setCurrentStep(4);
      toast({
        title: "Resume Optimized!",
        description: "Your resume has been successfully optimized with AI.",
      });
    },
    onError: (error) => {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize resume",
        variant: "destructive",
      });
    },
  });

  const handleOptimize = () => {
    if (!fileUpload.uploadedFile) {
      toast({
        title: "Upload Required",
        description: "Please upload your resume first",
        variant: "destructive",
      });
      return;
    }

    if (!jobDescription.content.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep(3);
    optimizeMutation.mutate();
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setOptimizationResult(null);
    fileUpload.resetUpload();
    jobDescription.resetContent();
  };

  // Update current step based on progress
  const updateStep = () => {
    if (optimizationResult) {
      setCurrentStep(4);
    } else if (optimizeMutation.isPending) {
      setCurrentStep(3);
    } else if (fileUpload.uploadedFile && jobDescription.analysisResult) {
      setCurrentStep(2);
    } else if (fileUpload.uploadedFile) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileUp className="text-primary-foreground" size={16} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">ResumeRevamp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <HelpCircle size={16} className="mr-1" />
                Help
              </Button>
              <Button size="sm">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Optimize Your Resume with AI
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume, paste a job description, and let our AI optimize your resume to match the job requirements perfectly.
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {!optimizationResult ? (
          <>
            {/* Main Workflow */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Upload Section */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileUp className="text-primary mr-2" size={20} />
                    Upload Your Resume
                  </h3>
                  <FileUpload 
                    onUploadSuccess={(result) => {
                      updateStep();
                      toast({
                        title: "Resume Uploaded",
                        description: `Successfully analyzed your ${result.fileType} resume`,
                      });
                    }}
                    onUploadError={(error) => {
                      toast({
                        title: "Upload Failed",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Job Description Section */}
              <Card className="p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="text-purple-600 mr-2" size={20} />
                    Job Description
                  </h3>
                  <JobDescriptionInput 
                    onAnalysisComplete={() => {
                      updateStep();
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mb-8">
              <Button 
                size="lg"
                onClick={handleOptimize}
                disabled={!fileUpload.uploadedFile || !jobDescription.analysisResult || optimizeMutation.isPending}
                className="px-8 py-3 text-lg"
              >
                {optimizeMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2" size={20} />
                    Optimize Resume with AI
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <ResultsSection 
            result={optimizationResult}
            onStartOver={handleStartOver}
          />
        )}

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-primary" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Optimization</h3>
            <p className="text-gray-600">Advanced natural language processing analyzes your resume and job requirements to optimize content intelligently.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-purple-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Perfect Job Matching</h3>
            <p className="text-gray-600">Automatically highlights relevant skills and experiences that align with specific job requirements and keywords.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Download className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-gray-600">Get your optimized resume in minutes, not hours. Professional formatting preserved with enhanced content.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileUp className="text-primary-foreground" size={16} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">ResumeRevamp</h3>
              </div>
              <p className="text-gray-600 text-sm">AI-powered resume optimization for better job matching and career success.</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">How it Works</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-gray-600">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-gray-600">GitHub</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">© 2024 ResumeRevamp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
