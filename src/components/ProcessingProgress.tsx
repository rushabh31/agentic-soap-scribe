
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAgent } from '@/contexts/AgentContext';
import { Brain, Lightbulb, MessageSquare } from 'lucide-react';

const ProcessingProgress: React.FC = () => {
  const { progress, currentAgent, agentInput, agentOutput } = useAgent();
  const { step, total } = progress;
  
  const percentComplete = Math.floor((step / total) * 100);
  
  const getStageLabel = (step: number): string => {
    switch (step) {
      case 1: return "Classifying call type";
      case 2: return "Extracting specialized information";
      case 3: return "Analyzing urgency and sentiment";
      case 4: return "Generating structured SOAP note";
      case 5: return "Evaluating clinical accuracy";
      case 6: return "Assessing documentation completeness";
      case 7: return "Verifying actionability";
      case 8: return "Processing with legacy system";
      case 9: return "Comparing results";
      case 10: return "Finalizing output";
      default: return "Processing";
    }
  };

  const getAgentName = (agentType: string | null): string => {
    if (!agentType) return "Unknown Agent";
    
    const nameMap: Record<string, string> = {
      routing: "Routing Agent",
      authorization: "Authorization Agent", 
      claims: "Claims Agent",
      general: "General Agent",
      urgency: "Urgency Analysis Engine",
      sentiment: "Sentiment Analysis Engine",
      medical: "Medical Information Extractor",
      soap_generator: "SOAP Note Generator",
      clinical_evaluator: "Clinical Accuracy Evaluator",
      completeness_evaluator: "Completeness Evaluator",
      actionability_evaluator: "Actionability Evaluator"
    };
    
    return nameMap[agentType] || agentType;
  };
  
  const getAgentDescription = (agentType: string | null): string => {
    if (!agentType) return "";
    
    const descriptionMap: Record<string, string> = {
      routing: "Determines the call type and routes to specialized agents",
      authorization: "Handles authorization requests and medical necessity determinations", 
      claims: "Processes claims-related inquiries and extracts key details",
      general: "Handles general member inquiries and customer service tasks",
      urgency: "Analyzes the clinical urgency level of the case",
      sentiment: "Detects member sentiment and emotional tone",
      medical: "Identifies medical conditions, treatments and medications",
      soap_generator: "Creates structured clinical documentation from conversation data",
      clinical_evaluator: "Verifies medical accuracy and adherence to clinical standards",
      completeness_evaluator: "Ensures all necessary information is documented",
      actionability_evaluator: "Confirms that the plan includes clear, specific steps"
    };
    
    return descriptionMap[agentType] || "";
  };
  
  const getAgentColor = (agentType: string | null): string => {
    if (!agentType) return "bg-gray-100 text-gray-800";
    
    const colorMap: Record<string, string> = {
      routing: "bg-blue-100 text-blue-800",
      authorization: "bg-purple-100 text-purple-800", 
      claims: "bg-green-100 text-green-800",
      general: "bg-gray-100 text-gray-800",
      urgency: "bg-red-100 text-red-800",
      sentiment: "bg-yellow-100 text-yellow-800",
      medical: "bg-teal-100 text-teal-800",
      soap_generator: "bg-indigo-100 text-indigo-800",
      clinical_evaluator: "bg-pink-100 text-pink-800",
      completeness_evaluator: "bg-orange-100 text-orange-800",
      actionability_evaluator: "bg-lime-100 text-lime-800"
    };
    
    return colorMap[agentType] || "bg-gray-100 text-gray-800";
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Processing Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{getStageLabel(step)}</span>
            <span>{percentComplete}% complete</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>
        
        {currentAgent && (
          <div className="animate-fade-in border rounded-md overflow-hidden">
            <div className={`p-4 ${getAgentColor(currentAgent)}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{getAgentName(currentAgent)}</h3>
                  <p className="text-xs">{getAgentDescription(currentAgent)}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              {agentInput && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-medium">Input</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border text-xs">
                    <p className="whitespace-pre-wrap">{agentInput}</p>
                  </div>
                </div>
              )}
              
              {agentOutput && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <h4 className="text-sm font-medium">Output</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border text-xs">
                    <p className="whitespace-pre-wrap">{agentOutput}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-500">
          {step === total ? (
            <span>Processing complete! Preparing results...</span>
          ) : (
            <span>Please wait while we process your transcript...</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingProgress;
