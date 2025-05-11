import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AgentState, SOAPNote, AgentMessage } from '@/types/agent';
import { MultiAgentSystem } from '@/services/MultiAgentSystem';
import { LegacyPipelineSystem } from '@/services/LegacyPipelineSystem';
import { useSettings } from './SettingsContext';
import { healthcareSystem } from '@/services/HealthcareContactCenterSystem';
import { CallDisposition } from '@/types/healthcare';
import { toast } from 'react-toastify';

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

const AgentContext = createContext<AgentContextType>({
  state: defaultAgentState,
  multiAgentState: null,
  sequentialState: null,
  comparisonResult: null,
  isProcessing: false,
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

  const multiAgentSystem = new MultiAgentSystem();
  const legacyPipelineSystem = new LegacyPipelineSystem();
  const { hasApiConfig, isOllamaConnected, isOllamaModelConnected, apiProvider, isGroqConnected, isGroqModelConnected } = useSettings();
  
  // Consider API config valid based on selected provider
  const isApiConfigValid = apiProvider === 'ollama' 
    ? hasApiConfig && isOllamaConnected && isOllamaModelConnected 
    : hasApiConfig && isGroqConnected && isGroqModelConnected;
  
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
            completeness: finalState.evaluationResults.multiAgent.completeness || { score: 0, comments: '' },
            accuracy: finalState.evaluationResults.multiAgent.accuracy || { score: 0, comments: '' },
            clinicalRelevance: finalState.evaluationResults.multiAgent.clinicalRelevance || { score: 0, comments: '' },
            actionability: finalState.evaluationResults.multiAgent.actionability || { score: 0, comments: '' },
            overallQuality: finalState.evaluationResults.multiAgent.overallQuality || 0,
            soapNote: finalState.evaluationResults.multiAgent.soapNote
          },
          sequential: {
            completeness: finalState.evaluationResults.sequential.completeness || { score: 0, comments: '' },
            accuracy: finalState.evaluationResults.sequential.accuracy || { score: 0, comments: '' },
            clinicalRelevance: finalState.evaluationResults.sequential.clinicalRelevance || { score: 0, comments: '' },
            actionability: finalState.evaluationResults.sequential.actionability || { score: 0, comments: '' },
            overallQuality: finalState.evaluationResults.sequential.overallQuality || 0,
            soapNote: finalState.evaluationResults.sequential.soapNote
          }
        };
        
        setComparisonResult(comparisonResult);
      }
      
      return finalState;
    } catch (error) {
      console.error('Error processing transcript:', error);
      toast.error(`Failed to process transcript: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      setIsProcessing(false);
      resetProcessingState();
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
      resetProcessingState();
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
    } catch (error) {
      console.error('Error processing with sequential pipeline:', error);
      toast.error(`Failed to process sequentially: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
      resetProcessingState();
    }
  }, []);

  const resetProcessingState = () => {
    setProcessingProgress(null);
    setAgentState(defaultAgentState);
    setMultiAgentState(null);
    setSequentialState(null);
    setComparisonResult(null);
  };

  const clearState = () => {
    setAgentState(defaultAgentState);
    setMultiAgentState(null);
    setSequentialState(null);
    setComparisonResult(null);
  };

  return (
    <AgentContext.Provider value={{
      state: agentState,
      multiAgentState,
      sequentialState,
      comparisonResult,
      isProcessing,
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
