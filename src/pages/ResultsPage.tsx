
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
import { 
  FileText, Layers, BarChart, ArrowLeft, AlertCircle, 
  Clock, Scale, MessageSquare, Clipboard, Brain 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ResultsPage = () => {
  const { state, legacyResult, comparison, evaluationResults, currentAgent, agentInput, agentOutput } = useAgent();
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
  
  const { soapNote, messages, transcript } = state;
  
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
                {state.sentiment && ` • Sentiment: ${state.sentiment.polarity}`}
                {state.urgency && ` • Urgency: ${state.urgency.level}`}
              </p>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="comparison" className="mb-6">
          <TabsList className="grid grid-cols-6">
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
              <MessageSquare className="h-4 w-4" />
              Agent Interactions
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Detailed Evaluation
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Original Transcript
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-md">
                <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-600" />
                    Multi-Agent System SOAP
                  </CardTitle>
                  <CardDescription>Collaborative AI system with specialized agents</CardDescription>
                </CardHeader>
                <CardContent>
                  {soapNote && (
                    <SOAPNoteDisplay soapNote={soapNote} title="" />
                  )}
                </CardContent>
              </Card>
              
              <Card className="shadow-md">
                <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-sky-50">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Legacy Pipeline SOAP
                  </CardTitle>
                  <CardDescription>Traditional sequential processing system</CardDescription>
                </CardHeader>
                <CardContent>
                  {legacyResult?.soapNote && (
                    <SOAPNoteDisplay soapNote={legacyResult.soapNote} title="" />
                  )}
                </CardContent>
              </Card>
            </div>
            
            {evaluationResults && (
              <div className="mt-6">
                <EvaluationResultsDisplay results={evaluationResults} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="multiagent">
            {soapNote && (
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-purple-600" />
                    Multi-Agent SOAP Note
                  </CardTitle>
                  <CardDescription>
                    Generated by an intelligent multi-agent system that specializes in healthcare documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SOAPNoteDisplay soapNote={soapNote} title="" />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="legacy">
            {legacyResult?.soapNote && (
              <Card className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Legacy Pipeline SOAP Note
                  </CardTitle>
                  <CardDescription>
                    Generated by traditional sequential processing system
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <SOAPNoteDisplay soapNote={legacyResult.soapNote} title="" />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="agents">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {messages && messages.length > 0 && (
                  <AgentInteractionDisplay messages={messages} />
                )}
              </div>
              <div>
                <Card className="shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-indigo-600" />
                      Agent Processing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">Current Agent</h3>
                        <div className="font-medium text-lg">{currentAgent || 'None'}</div>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <h3 className="text-sm font-medium mb-2 text-gray-600">Latest Input</h3>
                        <p className="text-xs whitespace-pre-wrap text-gray-600 max-h-40 overflow-y-auto">
                          {agentInput || 'No current input'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <h3 className="text-sm font-medium mb-2 text-gray-600">Latest Output</h3>
                        <p className="text-xs whitespace-pre-wrap text-gray-600 max-h-40 overflow-y-auto">
                          {agentOutput || 'No current output'}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">Message Count</h3>
                        <div className="font-medium text-lg">{messages?.length || 0} messages</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart className="h-5 w-5 text-green-600" />
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {state.urgency && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Urgency:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            state.urgency.level === 'high' ? 'bg-red-100 text-red-800' :
                            state.urgency.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {state.urgency.level} ({state.urgency.score}/10)
                          </span>
                        </div>
                      )}
                      
                      {state.sentiment && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sentiment:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            state.sentiment.polarity === 'positive' ? 'bg-green-100 text-green-800' :
                            state.sentiment.polarity === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {state.sentiment.polarity} ({state.sentiment.score})
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Extracted Medical Info:</span>
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {Object.keys(state.medicalInfo || {}).length} items
                        </span>
                      </div>
                      
                      {comparison?.winner && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Best System:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            comparison.winner === 'multiagent' ? 'bg-purple-100 text-purple-800' :
                            comparison.winner === 'legacy' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {comparison.winner === 'multiagent' ? 'Multi-Agent' : 
                             comparison.winner === 'legacy' ? 'Legacy Pipeline' : 'Tie'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="evaluation">
            {evaluationResults && (
              <EvaluationResultsDisplay results={evaluationResults} />
            )}
          </TabsContent>
          
          <TabsContent value="transcript">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clipboard className="h-5 w-5 text-gray-600" />
                  Original Transcript
                </CardTitle>
                <CardDescription>
                  The complete conversation between healthcare representative and member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-md border text-sm font-mono">
                  <pre className="whitespace-pre-wrap">{transcript}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default ResultsPage;
