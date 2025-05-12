
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AgentState } from '@/types/agent';
import { MultiAgentSystem } from '@/services/MultiAgentSystem';
import { getApiKey } from '@/services/groqAPI';

interface AgentContextType {
  state: AgentState | null;
  isProcessing: boolean;
  progress: { step: number; total: number };
  processTranscript: (transcript: string) => Promise<AgentState>;
  hasApiKey: boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AgentState | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ step: number; total: number }>({ step: 0, total: 7 });
  const multiAgentSystem = new MultiAgentSystem();
  
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
  
  const hasApiKey = !!getApiKey();
  
  return (
    <AgentContext.Provider value={{
      state,
      isProcessing,
      progress,
      processTranscript,
      hasApiKey
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
