
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgentState, SOAPNote, AgentMessage } from '@/types/agent';
import { MultiAgentSystem } from '@/services/MultiAgentSystem';
import { LegacyPipelineSystem } from '@/services/LegacyPipelineSystem';
import { useSettings } from './SettingsContext';

export interface ComparisonResult {
  multiAgent: {
    accuracy: { score: number; comments: string };
    completeness: { score: number; comments: string };
    actionability: { score: number; comments: string };
    overallQuality: number;
  };
  sequential: {
    accuracy: { score: number; comments: string };
    completeness: { score: number; comments: string };
    actionability: { score: number; comments: string };
    overallQuality: number;
  };
  winner: 'legacy' | 'multiagent' | 'tie';
  reasoning: string;
}

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
  evaluationResults: ComparisonResult | null;
  currentAgent: string | null;
  agentInput: string;
  agentOutput: string;
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
  const [evaluationResults, setEvaluationResults] = useState<ComparisonResult | null>(null);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState<string>('');
  const [agentOutput, setAgentOutput] = useState<string>('');

  const multiAgentSystem = new MultiAgentSystem();
  const legacyPipelineSystem = new LegacyPipelineSystem();
  const { hasApiConfig, isOllamaConnected, isOllamaModelConnected, apiProvider, isGroqConnected, isGroqModelConnected } = useSettings();
  
  // Consider API config valid based on selected provider
  const isApiConfigValid = apiProvider === 'ollama' 
    ? hasApiConfig && isOllamaConnected && isOllamaModelConnected 
    : hasApiConfig && isGroqConnected && isGroqModelConnected;
  
  const processTranscript = async (transcript: string): Promise<AgentState> => {
    setIsProcessing(true);
    setProgress({ step: 0, total: 10 });
    
    try {
      // Process with multi-agent system
      const result = await multiAgentSystem.processTranscript(
        transcript, 
        (updatedState, step, totalSteps, agentType, input, output) => {
          setState(updatedState);
          // Steps 1-7 are for multi-agent system
          setProgress({ step, total: 10 });
          
          // Update current agent information
          if (agentType) {
            setCurrentAgent(agentType);
            if (input) setAgentInput(input);
            if (output) setAgentOutput(output);
          }
        }
      );
      
      setState(result);
      
      // Process with legacy pipeline system
      setProgress({ step: 8, total: 10 });
      const legacyResult = await legacyPipelineSystem.processTranscript(
        transcript, 
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
      
      // Set detailed evaluation results
      const detailedResults = await evaluateComprehensively(result.soapNote, legacyResult.soapNote, transcript);
      setEvaluationResults(detailedResults);
      
      setProgress({ step: 10, total: 10 });
      
      return result;
    } finally {
      setIsProcessing(false);
      setCurrentAgent(null);
      setAgentInput('');
      setAgentOutput('');
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
    "accuracy": {"score": 8.5, "comments": "Detailed assessment of accuracy"},
    "completeness": {"score": 9.0, "comments": "Detailed assessment of completeness"},
    "actionability": {"score": 8.0, "comments": "Detailed assessment of actionability"}
  },
  "legacy": {
    "accuracy": {"score": 7.5, "comments": "Detailed assessment of accuracy"},
    "completeness": {"score": 8.0, "comments": "Detailed assessment of completeness"},
    "actionability": {"score": 7.0, "comments": "Detailed assessment of actionability"}
  },
  "winner": "multiagent",
  "reasoning": "Detailed explanation of the evaluation and why one is better than the other"
}
`;

      const { callApi } = await import('@/services/apiService');
      const response = await callApi([
        { role: 'system', content: 'You are an expert evaluator of healthcare documentation. You provide detailed, objective analysis with numerical scores and specific comparisons.' },
        { role: 'user', content: comparisonPrompt }
      ]);
      
      try {
        const result = JSON.parse(response);
        
        // Calculate multi-agent overall quality
        const multiAgentOverall = (
          result.multiAgent.accuracy.score +
          result.multiAgent.completeness.score +
          result.multiAgent.actionability.score
        ) / 3;
        
        // Calculate legacy overall quality
        const legacyOverall = (
          result.legacy.accuracy.score +
          result.legacy.completeness.score +
          result.legacy.actionability.score
        ) / 3;
        
        // Add overall quality scores
        result.multiAgent.overallQuality = multiAgentOverall;
        result.legacy.overallQuality = legacyOverall;
        
        // Calculate percentage differences
        const accuracyScore = 
          (result.multiAgent.accuracy.score - result.legacy.accuracy.score) / 
          ((result.multiAgent.accuracy.score + result.legacy.accuracy.score) / 2) * 100;
        
        const completenessScore = 
          (result.multiAgent.completeness.score - result.legacy.completeness.score) / 
          ((result.multiAgent.completeness.score + result.legacy.completeness.score) / 2) * 100;
        
        const actionabilityScore = 
          (result.multiAgent.actionability.score - result.legacy.actionability.score) / 
          ((result.multiAgent.actionability.score + result.legacy.actionability.score) / 2) * 100;
        
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
          accuracyScore: 5,
          completenessScore: 5,
          actionabilityScore: 5,
          winner: 'tie',
          reasoning: 'Unable to determine a clear winner due to evaluation error.'
        };
      }
    } catch (error) {
      console.error('Error comparing results:', error);
      return {
        accuracyScore: 5,
        completenessScore: 5,
        actionabilityScore: 5,
        winner: 'tie',
        reasoning: 'Unable to complete evaluation due to an error.'
      };
    }
  };

  const evaluateComprehensively = async (
    multiAgentSOAP: SOAPNote,
    legacySOAP: SOAPNote,
    transcript: string
  ): Promise<ComparisonResult> => {
    try {
      const evaluationPrompt = `
You are a senior healthcare documentation specialist tasked with evaluating SOAP notes generated by different systems.
Your evaluation must be detailed, objective, and focus on clinical accuracy and utility.

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

Please provide a comprehensive evaluation with:
1. Specific scores (1-10) for each dimension
2. Detailed comments highlighting strengths and weaknesses
3. Direct comparisons between the notes
4. A final determination of which note is superior and why

The evaluation must follow this exact JSON format:
{
  "multiAgent": {
    "accuracy": {"score": 8.5, "comments": "Detailed comments on accuracy"},
    "completeness": {"score": 7.8, "comments": "Detailed comments on completeness"},
    "actionability": {"score": 9.0, "comments": "Detailed comments on actionability"},
    "overallQuality": 8.4
  },
  "sequential": {
    "accuracy": {"score": 7.2, "comments": "Detailed comments on accuracy"},
    "completeness": {"score": 8.0, "comments": "Detailed comments on completeness"},
    "actionability": {"score": 7.5, "comments": "Detailed comments on actionability"},
    "overallQuality": 7.6
  },
  "winner": "multiagent",
  "reasoning": "Detailed explanation of overall comparison and justification for the winner"
}

Ensure your evaluation is fair, balanced, and focused on clinical utility rather than stylistic preferences.
`;

      const { callApi } = await import('@/services/apiService');
      const response = await callApi([
        { role: 'system', content: 'You are a senior healthcare documentation specialist with expertise in evaluating clinical documentation quality.' },
        { role: 'user', content: evaluationPrompt }
      ]);
      
      try {
        return JSON.parse(response) as ComparisonResult;
      } catch (parseError) {
        console.error('Error parsing evaluation result:', parseError);
        
        // Return default evaluation if parsing fails
        return {
          multiAgent: {
            accuracy: { score: 7.5, comments: "Unable to parse detailed comments" },
            completeness: { score: 7.5, comments: "Unable to parse detailed comments" },
            actionability: { score: 7.5, comments: "Unable to parse detailed comments" },
            overallQuality: 7.5
          },
          sequential: {
            accuracy: { score: 7.5, comments: "Unable to parse detailed comments" },
            completeness: { score: 7.5, comments: "Unable to parse detailed comments" },
            actionability: { score: 7.5, comments: "Unable to parse detailed comments" },
            overallQuality: 7.5
          },
          winner: 'tie',
          reasoning: 'Unable to determine a clear winner due to evaluation processing error.'
        };
      }
    } catch (error) {
      console.error('Error evaluating results:', error);
      
      // Return default evaluation if API call fails
      return {
        multiAgent: {
          accuracy: { score: 7.0, comments: "Error in evaluation process" },
          completeness: { score: 7.0, comments: "Error in evaluation process" },
          actionability: { score: 7.0, comments: "Error in evaluation process" },
          overallQuality: 7.0
        },
        sequential: {
          accuracy: { score: 7.0, comments: "Error in evaluation process" },
          completeness: { score: 7.0, comments: "Error in evaluation process" },
          actionability: { score: 7.0, comments: "Error in evaluation process" },
          overallQuality: 7.0
        },
        winner: 'tie',
        reasoning: 'Unable to complete evaluation due to a system error.'
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
      comparison,
      evaluationResults,
      currentAgent,
      agentInput,
      agentOutput
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
