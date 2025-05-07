
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { useAgent } from '@/contexts/AgentContext';
import SOAPNoteDisplay from '@/components/result/SOAPNoteDisplay';
import AgentInteractionDisplay from '@/components/result/AgentInteractionDisplay';
import EvaluationResultsDisplay from '@/components/result/EvaluationResults';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layers, BarChart, ArrowLeft, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ResultsPage = () => {
  const { state } = useAgent();
  const navigate = useNavigate();
  
  // If there's no processed state, redirect to the transcripts page
  if (!state) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                No Results Available
              </CardTitle>
              <CardDescription>
                No transcript has been processed yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8">
                Please submit a transcript to view results.
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => navigate('/transcripts')} 
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Go to Transcript Submission
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageLayout>
    );
  }
  
  const { soapNote, messages, evaluationResults } = state;
  
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Processing Results</h1>
          <Button variant="outline" onClick={() => navigate('/transcripts')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Process Another Transcript
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="bg-medical-secondary/50 p-4 rounded-md flex items-center space-x-3">
            <div className="bg-medical-primary rounded-full p-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Transcript Processed Successfully</h2>
              <p className="text-sm text-gray-600">
                {state.disposition ? `Call classified as: ${state.disposition}` : 'Call processed successfully'}
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="soap" className="mb-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="soap" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              SOAP Note
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Agent Interactions
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Evaluation
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="soap">
            <div className="space-y-6">
              {soapNote && (
                <SOAPNoteDisplay soapNote={soapNote} title="Multi-Agent SOAP Note" />
              )}
              
              {evaluationResults?.sequential?.soapNote && (
                <>
                  <Separator className="my-8" />
                  <SOAPNoteDisplay 
                    soapNote={evaluationResults.sequential.soapNote} 
                    title="Sequential Pipeline SOAP Note (For Comparison)" 
                  />
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="agents">
            {messages && messages.length > 0 && (
              <AgentInteractionDisplay messages={messages} />
            )}
          </TabsContent>
          
          <TabsContent value="evaluation">
            {evaluationResults && (
              <EvaluationResultsDisplay results={evaluationResults} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
