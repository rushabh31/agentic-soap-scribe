
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgentState } from '@/types/agent';
import { MultiAgentSystem } from '@/services/MultiAgentSystem';
import { useSettings } from './SettingsContext';

interface AgentContextType {
  state: AgentState | null;
  isProcessing: boolean;
  progress: { step: number; total: number };
  processTranscript: (transcript: string) => Promise<AgentState>;
  hasApiConfig: boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AgentState | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ step: number; total: number }>({ step: 0, total: 7 });
  const multiAgentSystem = new MultiAgentSystem();
  const { hasApiConfig, apiProvider, isOllamaConnected } = useSettings();
  
  // Consider API config valid if:
  // - For Groq: hasApiConfig is true
  // - For Ollama: hasApiConfig is true AND isOllamaConnected is true
  const isApiConfigValid = apiProvider === 'groq' ? 
    hasApiConfig : 
    (hasApiConfig && isOllamaConnected);
  
  const processTranscript = async (transcript: string): Promise<AgentState> => {
    setIsProcessing(true);
    setProgress({ step: 0, total: 7 });
    
    try {
      const result = await multiAgentSystem.processTranscript(transcript, 
        (updatedState, step, totalSteps) => {
          setState(updatedState);
          setProgress({ step, total: totalSteps });
        }
      );
      
      setState(result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <AgentContext.Provider value={{
      state,
      isProcessing,
      progress,
      processTranscript,
      hasApiConfig: isApiConfigValid
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
