
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  checkOllamaIsRunning,
  testOllamaModelConnection,
  getOllamaUrl,
  setOllamaUrl as setOllamaUrlStorage,
  getOllamaModel,
  setOllamaModel as setOllamaModelStorage,
  getApiProvider,
  setApiProvider as setApiProviderStorage,
  getGroqApiKey,
  setGroqApiKey as setGroqApiKeyStorage,
  getGroqModel,
  setGroqModel as setGroqModelStorage,
  testGroqModelConnection
} from '@/services/apiService';
import { toast } from 'sonner';

interface SettingsContextType {
  apiProvider: 'ollama' | 'groq';
  setApiProvider: (provider: 'ollama' | 'groq') => void;
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  groqApiKey: string;
  setGroqApiKey: (apiKey: string) => void;
  groqModel: string;
  setGroqModel: (model: string) => void;
  isOllamaConnected: boolean | null;
  isOllamaModelConnected: boolean | null;
  isGroqConnected: boolean | null;
  isGroqModelConnected: boolean | null;
  checkOllamaConnection: (notify?: boolean) => Promise<boolean>;
  checkGroqConnection: (notify?: boolean) => Promise<boolean>;
  hasApiConfig: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiProvider, setProviderState] = useState<'ollama' | 'groq'>(() => {
    const config = getApiProvider();
    return config.apiProvider;
  });
  
  const [ollamaUrl, setOllamaUrlState] = useState<string>(() => getOllamaUrl());
  const [ollamaModel, setOllamaModelState] = useState<string>(() => getOllamaModel() || 'llama3.1-8b-instant');
  const [groqApiKey, setGroqApiKeyState] = useState<string>(() => getGroqApiKey());
  const [groqModel, setGroqModelState] = useState<string>(() => getGroqModel() || 'llama3.1-8b-instant');
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean | null>(null);
  const [isOllamaModelConnected, setIsOllamaModelConnected] = useState<boolean | null>(null);
  const [isGroqConnected, setIsGroqConnected] = useState<boolean | null>(null);
  const [isGroqModelConnected, setIsGroqModelConnected] = useState<boolean | null>(null);

  // Compute whether we have a valid API configuration based on the selected provider
  const hasApiConfig = React.useMemo(() => {
    if (apiProvider === 'ollama') {
      return Boolean(ollamaUrl && ollamaModel);
    } else if (apiProvider === 'groq') {
      return Boolean(groqApiKey && groqModel);
    }
    return false;
  }, [apiProvider, ollamaUrl, ollamaModel, groqApiKey, groqModel]);

  useEffect(() => {
    if (apiProvider === 'ollama') {
      checkOllamaConnection();
    } else if (apiProvider === 'groq' && groqApiKey) {
      checkGroqConnection();
    }
  }, [apiProvider, ollamaUrl, ollamaModel, groqApiKey, groqModel]);

  const setApiProvider = (provider: 'ollama' | 'groq') => {
    setProviderState(provider);
    setApiProviderStorage(provider);
  };

  const setOllamaUrl = (url: string) => {
    setOllamaUrlState(url);
    setOllamaUrlStorage(url);
  };
  
  const setOllamaModel = (model: string) => {
    setOllamaModelState(model);
    setOllamaModelStorage(model);
  };

  const setGroqApiKey = (apiKey: string) => {
    setGroqApiKeyState(apiKey);
    setGroqApiKeyStorage(apiKey);
  };
  
  const setGroqModel = (model: string) => {
    setGroqModelState(model);
    setGroqModelStorage(model);
  };

  const checkOllamaConnection = async (notify: boolean = false): Promise<boolean> => {
    try {
      // First check if the Ollama server is running
      const isRunning = await checkOllamaIsRunning(ollamaUrl);
      setIsOllamaConnected(isRunning);
      
      if (!isRunning) {
        setIsOllamaModelConnected(false);
        if (notify) {
          toast.error(`Cannot connect to Ollama at ${ollamaUrl}`);
        }
        return false;
      }
      
      // Then test if the model is available
      if (ollamaModel) {
        try {
          const testResponse = await testOllamaModelConnection(ollamaUrl, ollamaModel);
          const isModelConnected = !!testResponse;
          setIsOllamaModelConnected(isModelConnected);
          
          if (!isModelConnected && notify) {
            toast.error(`Model ${ollamaModel} not available on Ollama server`);
          }
          
          return isModelConnected;
        } catch (modelError) {
          setIsOllamaModelConnected(false);
          if (notify) {
            toast.error(`Error testing Ollama model: ${modelError instanceof Error ? modelError.message : String(modelError)}`);
          }
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking if Ollama is running:', error);
      setIsOllamaConnected(false);
      setIsOllamaModelConnected(false);
      if (notify) {
        toast.error(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
      return false;
    }
  };

  const checkGroqConnection = async (notify: boolean = false): Promise<boolean> => {
    if (!groqApiKey) {
      setIsGroqConnected(false);
      setIsGroqModelConnected(false);
      return false;
    }

    try {
      setIsGroqConnected(true);
      
      if (groqModel) {
        try {
          const testResponse = await testGroqModelConnection(groqApiKey, groqModel);
          const isModelConnected = !!testResponse;
          setIsGroqModelConnected(isModelConnected);
          
          if (!isModelConnected && notify) {
            toast.error(`Model ${groqModel} not available on Groq API`);
          }
          
          return isModelConnected;
        } catch (modelError) {
          setIsGroqModelConnected(false);
          if (notify) {
            toast.error(`Error testing Groq model: ${modelError instanceof Error ? modelError.message : String(modelError)}`);
          }
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error connecting to Groq API:', error);
      setIsGroqConnected(false);
      setIsGroqModelConnected(false);
      if (notify) {
        toast.error(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
      }
      return false;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        apiProvider,
        setApiProvider,
        ollamaUrl,
        setOllamaUrl,
        ollamaModel,
        setOllamaModel,
        groqApiKey,
        setGroqApiKey,
        groqModel,
        setGroqModel,
        isOllamaConnected,
        isOllamaModelConnected,
        isGroqConnected,
        isGroqModelConnected,
        checkOllamaConnection,
        checkGroqConnection,
        hasApiConfig
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
