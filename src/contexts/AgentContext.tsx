
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AgentState, SOAPNote, AgentMessage, CallDisposition, ProcessingProgress } from '@/types/agent';
import { MultiAgentSystem } from '@/services/MultiAgentSystem';
import { LegacyPipelineSystem } from '@/services/LegacyPipelineSystem';
import { useSettings } from './SettingsContext';
import { healthcareSystem } from '@/services/HealthcareContactCenterSystem';
import { toast } from 'sonner'; // Using sonner instead of react-toastify

export interface ComparisonResult {
  winner: 'multiagent' | 'legacy' | 'tie';
  reasoning: string;
  multiAgent: {
    completeness: { score: number, comments: string };
    accuracy: { score: number, comments: string };
    clinicalRelevance: { score: number, comments: string };
    actionability: { score: number, comments: string };
    overallQuality: number;
    soapNote?: SOAPNote;
  };
  sequential: {
    completeness: { score: number, comments: string };
    accuracy: { score: number, comments: string };
    clinicalRelevance: { score: number, comments: string };
    actionability: { score: number, comments: string };
    overallQuality: number;
    soapNote?: SOAPNote;
  };
}

interface AgentContextType {
  state: AgentState;
  multiAgentState: AgentState | null;
  sequentialState: AgentState | null;
  comparisonResult: ComparisonResult | null;
  isProcessing: boolean;
  progress: ProcessingProgress;
  currentAgent: string | null;
  agentInput: string | null;
  agentOutput: string | null;
  legacyResult: any | null;
  comparison: any | null;
  evaluationResults: any | null;
  hasApiConfig: boolean;
  processTranscript: (transcript: string) => Promise<AgentState>;
  processWithAgents: (transcript: string) => Promise<void>;
  processWithSequential: (transcript: string) => Promise<void>;
  resetProcessingState: () => void;
  clearState: () => void;
}

const defaultAgentState: AgentState = {
  extractedInfo: {},
  messages: []
};

const defaultProgress: ProcessingProgress = {
  step: 0,
  total: 10
};

const AgentContext = createContext<AgentContextType>({
  state: defaultAgentState,
  multiAgentState: null,
  sequentialState: null,
  comparisonResult: null,
  isProcessing: false,
  progress: defaultProgress,
  currentAgent: null,
  agentInput: null,
  agentOutput: null,
  legacyResult: null,
  comparison: null,
  evaluationResults: null,
  hasApiConfig: false,
  processTranscript: async () => defaultAgentState,
  processWithAgents: async () => {},
  processWithSequential: async () => {},
  resetProcessingState: () => {},
  clearState: () => {}
});

export const useAgent = () => useContext(AgentContext);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [agentState, setAgentState] = useState<AgentState>(defaultAgentState);
  const [multiAgentState, setMultiAgentState] = useState<AgentState | null>(null);
  const [sequentialState, setSequentialState] = useState<AgentState | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProcessingProgress>(defaultProgress);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [agentInput, setAgentInput] = useState<string | null>(null);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [legacyResult, setLegacyResult] = useState<any | null>(null);
  const [comparison, setComparison] = useState<any | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<any | null>(null);

  const multiAgentSystem = new MultiAgentSystem();
  const legacyPipelineSystem = new LegacyPipelineSystem();
  const { apiProvider, isOllamaConnected, isOllamaModelConnected, isGroqConnected, isGroqModelConnected } = useSettings();
  
  // Consider API config valid based on selected provider
  const hasApiConfig = apiProvider === 'ollama' 
    ? isOllamaConnected && isOllamaModelConnected 
    : isGroqConnected && isGroqModelConnected;
  
  const setProcessingProgress = (data: {
    currentStep: number;
    totalSteps: number;
    agentType?: string;
    input?: string;
    output?: string;
  }) => {
    setProgress({
      step: data.currentStep,
      total: data.totalSteps
    });
    setCurrentAgent(data.agentType || null);
    setAgentInput(data.input || null);
    setAgentOutput(data.output || null);
  };
  
  // Process transcript through multi-agent system and sequential pipeline
  const processTranscript = useCallback(async (transcript: string): Promise<AgentState> => {
    try {
      setIsProcessing(true);

      // Use the healthcare contact center system to process and evaluate the transcript
      const finalState = await healthcareSystem.processAndEvaluateCall(
        transcript,
        (state, step, totalSteps, agentType, input, output) => {
          setProcessingProgress({
            currentStep: step,
            totalSteps,
            agentType,
            input,
            output
          });
        }
      );
      
      setAgentState(finalState);
      
      // Extract comparison results for UI display
      if (finalState.evaluationResults) {
        const comparisonResult: ComparisonResult = {
          winner: finalState.evaluationResults.winner || 'tie',
          reasoning: finalState.evaluationResults.reasoning || '',
          multiAgent: {
            completeness: { 
              score: finalState.evaluationResults.multiAgent.completeness?.score || 0, 
              comments: finalState.evaluationResults.multiAgent.completeness?.comments || '' 
            },
            accuracy: { 
              score: finalState.evaluationResults.multiAgent.accuracy?.score || 0, 
              comments: finalState.evaluationResults.multiAgent.accuracy?.comments || '' 
            },
            clinicalRelevance: { 
              score: finalState.evaluationResults.multiAgent.clinicalRelevance?.score || 0, 
              comments: finalState.evaluationResults.multiAgent.clinicalRelevance?.comments || '' 
            },
            actionability: { 
              score: finalState.evaluationResults.multiAgent.actionability?.score || 0, 
              comments: finalState.evaluationResults.multiAgent.actionability?.comments || '' 
            },
            overallQuality: finalState.evaluationResults.multiAgent.overallQuality || 0,
            soapNote: finalState.evaluationResults.multiAgent.soapNote
          },
          sequential: {
            completeness: { 
              score: finalState.evaluationResults.sequential.completeness?.score || 0, 
              comments: finalState.evaluationResults.sequential.completeness?.comments || '' 
            },
            accuracy: { 
              score: finalState.evaluationResults.sequential.accuracy?.score || 0, 
              comments: finalState.evaluationResults.sequential.accuracy?.comments || '' 
            },
            clinicalRelevance: { 
              score: finalState.evaluationResults.sequential.clinicalRelevance?.score || 0, 
              comments: finalState.evaluationResults.sequential.clinicalRelevance?.comments || '' 
            },
            actionability: { 
              score: finalState.evaluationResults.sequential.actionability?.score || 0, 
              comments: finalState.evaluationResults.sequential.actionability?.comments || '' 
            },
            overallQuality: finalState.evaluationResults.sequential.overallQuality || 0,
            soapNote: finalState.evaluationResults.sequential.soapNote
          }
        };
        
        setComparisonResult(comparisonResult);
        setEvaluationResults(finalState.evaluationResults);
      }
      
      return finalState;
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error(`Failed to process transcript: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsProcessing(false);
      setProcessingProgress({
        currentStep: 0,
        totalSteps: 10
      });
    }
  }, []);

  // Process with multi-agent system only
  const processWithAgents = useCallback(async (transcript: string): Promise<void> => {
    try {
      setIsProcessing(true);
      
      const result = await healthcareSystem.runMultiAgentSystem(
        transcript,
        (state, step, totalSteps, agentType, input, output) => {
          setProcessingProgress({
            currentStep: step,
            totalSteps,
            agentType,
            input,
            output
          });
        }
      );
      
      setMultiAgentState(result);
      setAgentState(result);
    } catch (error) {
      console.error('Error processing with multi-agent system:', error);
      toast.error(`Failed to process with agents: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress({
        currentStep: 0,
        totalSteps: 10
      });
    }
  }, []);

  // Process with sequential pipeline only
  const processWithSequential = useCallback(async (transcript: string): Promise<void> => {
    try {
      setIsProcessing(true);
      
      const result = await healthcareSystem.runSequentialPipeline(transcript);
      
      const sequentialState: AgentState = {
        transcript,
        disposition: result.disposition as CallDisposition,
        extractedInfo: {},
        sentiment: {
          overall: result.sentiment.sentiment,
          score: result.sentiment.score,
          details: ''
        },
        soapNote: result.summary,
        messages: []
      };
      
      setSequentialState(sequentialState);
      setAgentState(sequentialState);
      setLegacyResult(result);
    } catch (error) {
      console.error('Error processing with sequential pipeline:', error);
      toast.error(`Failed to process sequentially: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      setProcessingProgress({
        currentStep: 0,
        totalSteps: 10
      });
    }
  }, []);

  const resetProcessingState = () => {
    setProgress(defaultProgress);
    setCurrentAgent(null);
    setAgentInput(null);
    setAgentOutput(null);
  };

  const clearState = () => {
    setAgentState(defaultAgentState);
    setMultiAgentState(null);
    setSequentialState(null);
    setComparisonResult(null);
    setEvaluationResults(null);
    setLegacyResult(null);
    setComparison(null);
  };

  return (
    <AgentContext.Provider value={{
      state: agentState,
      multiAgentState,
      sequentialState,
      comparisonResult,
      isProcessing,
      progress,
      currentAgent,
      agentInput,
      agentOutput,
      legacyResult,
      comparison,
      evaluationResults,
      hasApiConfig,
      processTranscript,
      processWithAgents,
      processWithSequential,
      resetProcessingState,
      clearState
    }}>
      {children}
    </AgentContext.Provider>
  );
};
