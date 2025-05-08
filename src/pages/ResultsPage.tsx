
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
import { FileText, Layers, BarChart, ArrowLeft, AlertCircle, Clock, Scale } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ResultsPage = () => {
  const { state, legacyResult, comparison } = useAgent();
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
  
  const { soapNote, messages } = state;
  
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
        
        <Tabs defaultValue="comparison" className="mb-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Comparison
            </TabsTrigger>
            <TabsTrigger value="multiagent" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Multi-Agent SOAP
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Legacy SOAP
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Agent Interactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Multi-Agent System SOAP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {soapNote && (
                    <SOAPNoteDisplay soapNote={soapNote} title="" />
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Legacy Pipeline SOAP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {legacyResult?.soapNote && (
                    <SOAPNoteDisplay soapNote={legacyResult.soapNote} title="" />
                  )}
                </CardContent>
              </Card>
            </div>
            
            {comparison && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    SOAP Note Comparison
                  </CardTitle>
                  <CardDescription>
                    Evaluation of both SOAP notes based on accuracy, completeness, and actionability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h3 className="font-medium text-blue-800 mb-2">Accuracy Difference</h3>
                        <div className="text-2xl font-bold text-blue-600">
                          {comparison.accuracyScore > 0 ? '+' : ''}{comparison.accuracyScore.toFixed(1)}%
                        </div>
                        <p className="text-sm text-blue-700">
                          {comparison.accuracyScore > 0 
                            ? 'Multi-agent system is more accurate' 
                            : comparison.accuracyScore < 0 
                              ? 'Legacy system is more accurate'
                              : 'Equal accuracy'}
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-medium text-purple-800 mb-2">Completeness Difference</h3>
                        <div className="text-2xl font-bold text-purple-600">
                          {comparison.completenessScore > 0 ? '+' : ''}{comparison.completenessScore.toFixed(1)}%
                        </div>
                        <p className="text-sm text-purple-700">
                          {comparison.completenessScore > 0 
                            ? 'Multi-agent system is more complete' 
                            : comparison.completenessScore < 0 
                              ? 'Legacy system is more complete'
                              : 'Equal completeness'}
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-medium text-green-800 mb-2">Actionability Difference</h3>
                        <div className="text-2xl font-bold text-green-600">
                          {comparison.actionabilityScore > 0 ? '+' : ''}{comparison.actionabilityScore.toFixed(1)}%
                        </div>
                        <p className="text-sm text-green-700">
                          {comparison.actionabilityScore > 0 
                            ? 'Multi-agent system is more actionable' 
                            : comparison.actionabilityScore < 0 
                              ? 'Legacy system is more actionable'
                              : 'Equal actionability'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          comparison.winner === 'multiagent' 
                            ? 'bg-blue-100 text-blue-800' 
                            : comparison.winner === 'legacy' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          <Scale className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-semibold">
                          {comparison.winner === 'multiagent' 
                            ? 'Multi-Agent System Wins' 
                            : comparison.winner === 'legacy' 
                              ? 'Legacy System Wins'
                              : 'It\'s a Tie'}
                        </h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comparison.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="multiagent">
            {soapNote && (
              <SOAPNoteDisplay soapNote={soapNote} title="Multi-Agent SOAP Note" />
            )}
          </TabsContent>
          
          <TabsContent value="legacy">
            {legacyResult?.soapNote && (
              <SOAPNoteDisplay soapNote={legacyResult.soapNote} title="Legacy Pipeline SOAP Note" />
            )}
          </TabsContent>
          
          <TabsContent value="agents">
            {messages && messages.length > 0 && (
              <AgentInteractionDisplay messages={messages} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
