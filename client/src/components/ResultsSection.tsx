import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Sparkles, 
  Download, 
  RotateCcw, 
  CheckCircle,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Clock,
  Copy
} from "lucide-react";
import type { OptimizationResponse } from "@shared/schema";

interface ResultsSectionProps {
  result: OptimizationResponse;
  onStartOver: () => void;
}

export default function ResultsSection({ result, onStartOver }: ResultsSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result.optimizedContent);
      toast({
        title: "Copied to Clipboard",
        description: "Resume content copied in markup format",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Get the optimization ID from the result
      const optimizationId = (result as any).optimizationId;
      
      if (!optimizationId) {
        toast({
          title: "Download Failed",
          description: "Optimization ID not found",
          variant: "destructive",
        });
        return;
      }

      // Call the download API
      const response = await fetch(`/api/download/${optimizationId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
        : 'optimized_resume.docx';
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "Your optimized resume has been downloaded as a Word document",
      });
      
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the Word document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper function to format content sections with better markdown parsing
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Headers (lines starting with ##)
      if (line.startsWith('## ')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-1">
            {line.replace('## ', '')}
          </h3>
        );
      }
      
      // Subheaders (lines starting with ###)
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="text-md font-semibold text-gray-800 mt-4 mb-2">
            {line.replace('### ', '')}
          </h4>
        );
      }
      
      // Bold text (lines starting with **)
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={index} className="font-semibold text-gray-800 mb-2 mt-3">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      
      // Bullet points (lines starting with -)
      if (line.startsWith('- ')) {
        return (
          <div key={index} className="flex items-start mb-1">
            <span className="text-primary mr-2 mt-1">•</span>
            <span className="text-gray-700 leading-relaxed">{line.replace('- ', '')}</span>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 mb-1 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="space-y-8">
      {/* Comparison View */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Original Resume */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="text-gray-500 mr-2" size={20} />
              Original Resume
            </h3>
          </div>
          <CardContent className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {formatContent(result.originalContent)}
            </div>
          </CardContent>
        </Card>

        {/* Optimized Resume */}
        <Card className="relative">
          <Badge className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600">
            Optimized
          </Badge>
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="text-primary mr-2" size={20} />
                AI-Optimized Resume
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Markup
              </Button>
            </div>
          </div>
          <CardContent className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {formatContent(result.optimizedContent)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvements Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="text-green-500 mr-2" size={20} />
          Optimization Summary
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {result.improvements.matchScore}%
            </div>
            <p className="text-sm text-green-700 font-medium">Job Match Score</p>
            <p className="text-xs text-green-600 mt-1">+{Math.max(0, result.improvements.matchScore - 50)}% improvement</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {result.improvements.keywordsAdded}
            </div>
            <p className="text-sm text-blue-700 font-medium">Keywords Added</p>
            <p className="text-xs text-blue-600 mt-1">From job requirements</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {result.improvements.sectionsImproved}
            </div>
            <p className="text-sm text-purple-700 font-medium">Sections Enhanced</p>
            <p className="text-xs text-purple-600 mt-1">Experience, skills, summary</p>
          </div>
        </div>

        {/* Improvement List */}
        {result.improvements.improvementsList.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Improvements Made:</h4>
            <ul className="space-y-2">
              {result.improvements.improvementsList.map((improvement, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-700">{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Download Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-purple-50 p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Optimized Resume is Ready!</h3>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Download your AI-optimized resume in DOCX format, ready to submit for your dream job. 
          The formatting has been preserved while enhancing the content for maximum impact.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button 
            size="lg"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-8 py-3 text-lg"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                Preparing Download...
              </>
            ) : (
              <>
                <Download className="mr-2" size={20} />
                Download Resume (.docx)
              </>
            )}
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600 mb-6">
          <span className="flex items-center">
            <Shield className="text-green-500 mr-1" size={16} />
            Secure Download
          </span>
          <span className="flex items-center">
            <FileText className="text-blue-500 mr-1" size={16} />
            Word Compatible
          </span>
          <span className="flex items-center">
            <Clock className="text-gray-500 mr-1" size={16} />
            Instant Download
          </span>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onStartOver}
            className="font-medium"
          >
            <RotateCcw className="mr-1" size={16} />
            Optimize Another Resume
          </Button>
        </div>
      </Card>
    </div>
  );
}
