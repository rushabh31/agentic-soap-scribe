
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgentState, SOAPNote } from '@/types/agent';
import { MultiAgentSystem } from '@/services/MultiAgentSystem';
import { LegacyPipelineSystem } from '@/services/LegacyPipelineSystem';
import { useSettings } from './SettingsContext';

interface AgentContextType {
  state: AgentState | null;
  legacyResult: {
    soapNote: SOAPNote;
    disposition: string;
    sentiment: string;
  } | null;
  isProcessing: boolean;
  progress: { step: number; total: number };
  processTranscript: (transcript: string) => Promise<AgentState>;
  hasApiConfig: boolean;
  comparison: {
    accuracyScore: number;
    completenessScore: number;
    actionabilityScore: number;
    winner: 'legacy' | 'multiagent' | 'tie';
    reasoning: string;
  } | null;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AgentState | null>(null);
  const [legacyResult, setLegacyResult] = useState<{
    soapNote: SOAPNote;
    disposition: string;
    sentiment: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ step: number; total: number }>({ step: 0, total: 10 });
  const [comparison, setComparison] = useState<{
    accuracyScore: number;
    completenessScore: number;
    actionabilityScore: number;
    winner: 'legacy' | 'multiagent' | 'tie';
    reasoning: string;
  } | null>(null);

  const multiAgentSystem = new MultiAgentSystem();
  const legacyPipelineSystem = new LegacyPipelineSystem();
  const { hasApiConfig, isOllamaConnected, isOllamaModelConnected } = useSettings();
  
  // Consider API config valid if Ollama is connected and model is available
  const isApiConfigValid = hasApiConfig && isOllamaConnected && isOllamaModelConnected;
  
  const processTranscript = async (transcript: string): Promise<AgentState> => {
    setIsProcessing(true);
    setProgress({ step: 0, total: 10 });
    
    try {
      // Process with multi-agent system
      const result = await multiAgentSystem.processTranscript(transcript, 
        (updatedState, step, totalSteps) => {
          setState(updatedState);
          // Steps 1-7 are for multi-agent system
          setProgress({ step, total: 10 });
        }
      );
      
      setState(result);
      
      // Process with legacy pipeline system
      setProgress({ step: 8, total: 10 });
      const legacyResult = await legacyPipelineSystem.processTranscript(transcript, 
        (step, total, message) => {
          // Steps 8-9 are for legacy system (mapped to 8)
          setProgress({ step: 8, total: 10 });
        }
      );
      
      setLegacyResult(legacyResult);
      
      // Compare the results
      setProgress({ step: 9, total: 10 });
      const comparisonResult = await compareResults(result.soapNote, legacyResult.soapNote, transcript);
      setComparison(comparisonResult);
      
      setProgress({ step: 10, total: 10 });
      
      return result;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const compareResults = async (
    multiAgentSOAP: SOAPNote,
    legacySOAP: SOAPNote,
    transcript: string
  ): Promise<{
    accuracyScore: number;
    completenessScore: number;
    actionabilityScore: number;
    winner: 'legacy' | 'multiagent' | 'tie';
    reasoning: string;
  }> => {
    try {
      const comparisonPrompt = `
You are an expert evaluator of healthcare SOAP notes. You need to compare two SOAP notes generated from the same call transcript - one by a multi-agent system and one by a legacy pipeline system.

ORIGINAL TRANSCRIPT:
${transcript}

MULTI-AGENT SYSTEM SOAP NOTE:
SUBJECTIVE:
${multiAgentSOAP.subjective}

OBJECTIVE:
${multiAgentSOAP.objective}

ASSESSMENT:
${multiAgentSOAP.assessment}

PLAN:
${multiAgentSOAP.plan}

LEGACY PIPELINE SOAP NOTE:
SUBJECTIVE:
${legacySOAP.subjective}

OBJECTIVE:
${legacySOAP.objective}

ASSESSMENT:
${legacySOAP.assessment}

PLAN:
${legacySOAP.plan}

Please evaluate both SOAP notes based on these criteria:
1. Accuracy (factual correctness): Score each from 1-10
2. Completeness (inclusion of all relevant details): Score each from 1-10
3. Actionability (clarity and specificity of plan): Score each from 1-10

Determine which SOAP note is overall better and explain your reasoning.

Format your response as a valid JSON object with the following structure:
{
  "multiAgent": {
    "accuracy": [score 1-10],
    "completeness": [score 1-10],
    "actionability": [score 1-10]
  },
  "legacy": {
    "accuracy": [score 1-10],
    "completeness": [score 1-10],
    "actionability": [score 1-10]
  },
  "winner": ["legacy" or "multiagent" or "tie"],
  "reasoning": [explanation of your evaluation]
}
`;

      const { callApi } = await import('@/services/apiService');
      const response = await callApi([
        { role: 'system', content: 'You are an expert evaluator of healthcare documentation.' },
        { role: 'user', content: comparisonPrompt }
      ]);
      
      try {
        const result = JSON.parse(response);
        const accuracyScore = 
          (result.multiAgent.accuracy - result.legacy.accuracy) / 
          ((result.multiAgent.accuracy + result.legacy.accuracy) / 2) * 100;
        
        const completenessScore = 
          (result.multiAgent.completeness - result.legacy.completeness) / 
          ((result.multiAgent.completeness + result.legacy.completeness) / 2) * 100;
        
        const actionabilityScore = 
          (result.multiAgent.actionability - result.legacy.actionability) / 
          ((result.multiAgent.actionability + result.legacy.actionability) / 2) * 100;
        
        return {
          accuracyScore,
          completenessScore,
          actionabilityScore,
          winner: result.winner,
          reasoning: result.reasoning
        };
      } catch (parseError) {
        console.error('Error parsing comparison result:', parseError);
        return {
          accuracyScore: 0,
          completenessScore: 0,
          actionabilityScore: 0,
          winner: 'tie',
          reasoning: 'Unable to determine a clear winner due to evaluation error.'
        };
      }
    } catch (error) {
      console.error('Error comparing results:', error);
      return {
        accuracyScore: 0,
        completenessScore: 0,
        actionabilityScore: 0,
        winner: 'tie',
        reasoning: 'Unable to complete evaluation due to an error.'
      };
    }
  };
  
  return (
    <AgentContext.Provider value={{
      state,
      legacyResult,
      isProcessing,
      progress,
      processTranscript,
      hasApiConfig: isApiConfigValid,
      comparison
    }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
