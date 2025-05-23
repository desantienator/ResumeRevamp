import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, CheckCircle } from "lucide-react";
import { useJobDescription } from "@/hooks/useJobDescription";

interface JobDescriptionInputProps {
  onAnalysisComplete?: () => void;
  content: string;
  setContent: (content: string) => void;
  analysisResult: any;
  isAnalyzing: boolean;
  lastSaved: string;
  characterCount: number;
}

export default function JobDescriptionInput({ 
  onAnalysisComplete, 
  content, 
  setContent, 
  analysisResult, 
  isAnalyzing, 
  lastSaved,
  characterCount 
}: JobDescriptionInputProps) {

  useEffect(() => {
    if (analysisResult && onAnalysisComplete) {
      onAnalysisComplete();
    }
  }, [analysisResult, onAnalysisComplete]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
          Paste the job description you're applying for
        </Label>
        <Textarea
          id="job-description"
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the complete job description here. Include requirements, responsibilities, and desired qualifications for best results..."
          className="w-full resize-none"
          maxLength={5000}
        />
      </div>
      
      {/* Character Counter and Auto-save Status */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500 flex items-center">
          <Save className="mr-1" size={14} />
          {lastSaved ? "Auto-saved" : "Not saved"}
        </span>
        <span className="text-gray-600">
          <span className={`font-medium ${characterCount > 4500 ? 'text-orange-600' : ''}`}>
            {characterCount}
          </span> / 5,000 characters
        </span>
      </div>

      {/* Job Analysis Results */}
      {analysisResult && (
        <Card className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <CheckCircle className="text-green-500 mr-2" size={16} />
            Job Requirements Analysis
          </h4>
          
          <div className="space-y-3">
            {/* Required Skills */}
            {analysisResult.analysis.requiredSkills.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Key Skills Required</p>
                <div className="flex flex-wrap gap-1">
                  {analysisResult.analysis.requiredSkills.slice(0, 10).map((skill, index) => (
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
            
            {/* Experience Level */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Experience Level</p>
              <span className="text-sm font-medium text-gray-900">
                {analysisResult.analysis.experienceLevel}
              </span>
            </div>

            {/* Industry */}
            {analysisResult.analysis.industry && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Industry</p>
                <span className="text-sm font-medium text-gray-900">
                  {analysisResult.analysis.industry}
                </span>
              </div>
            )}

            {/* Key Requirements */}
            {analysisResult.analysis.keyRequirements.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Key Requirements</p>
                <ul className="text-xs text-gray-700 space-y-1">
                  {analysisResult.analysis.keyRequirements.slice(0, 5).map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
            <span className="text-sm text-gray-600">Analyzing job requirements...</span>
          </div>
        </Card>
      )}
    </div>
  );
}
