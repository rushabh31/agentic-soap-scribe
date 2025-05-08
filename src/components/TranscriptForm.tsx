
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { FileText, AlertCircle, Send } from 'lucide-react';
import { useAgent } from '@/contexts/AgentContext';
import ApiKeyForm from './ApiKeyForm';

const TranscriptForm: React.FC = () => {
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { processTranscript, isProcessing, hasApiConfig } = useAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transcript.trim()) {
      toast({
        title: 'Empty Transcript',
        description: 'Please enter a transcript to analyze.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await processTranscript(transcript);
      navigate('/results');
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast({
        title: 'Processing Error',
        description: error instanceof Error ? error.message : 'Failed to process transcript',
        variant: 'destructive',
      });
    }
  };

  // If no API is configured, show the API configuration form instead
  if (!hasApiConfig) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please configure your AI provider before proceeding
              </p>
            </div>
          </div>
        </div>
        <ApiKeyForm />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submit Transcript
          </CardTitle>
          <CardDescription>
            Enter a healthcare call transcript below to process it through the multi-agent system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste your healthcare call transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            disabled={isProcessing}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            type="submit" 
            className="px-6 py-2" 
            disabled={isProcessing || !transcript.trim()}
          >
            {isProcessing ? 'Processing...' : 'Process Transcript'} <Send className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default TranscriptForm;
