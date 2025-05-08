
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getApiProvider, getOllamaUrl, setOllamaUrl, ApiProvider, getOllamaModel, setOllamaModel, testOllamaModelConnection, checkOllamaIsRunning } from '@/services/apiService';

interface SettingsContextType {
  apiProvider: ApiProvider;
  setApiProviderValue: (provider: ApiProvider) => void;
  ollamaUrl: string;
  setOllamaUrlValue: (url: string) => void;
  ollamaModel: string;
  setOllamaModelValue: (model: string) => void;
  hasApiConfig: boolean;
  isOllamaConnected: boolean;
  isOllamaModelConnected: boolean;
  testResponse: string | null;
  checkOllamaConnection: () => Promise<boolean>;
  checkOllamaModelConnection: (model?: string) => Promise<boolean>;
  testOllamaModel: (model: string) => Promise<string>;
  isTestingModel: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiProvider] = useState<ApiProvider>('ollama');
  const [ollamaUrl, setOllamaUrlState] = useState<string>(getOllamaUrl());
  const [ollamaModel, setOllamaModelState] = useState<string>(getOllamaModel());
  const [hasApiConfig, setHasApiConfig] = useState<boolean>(!!getOllamaUrl());
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [isOllamaModelConnected, setIsOllamaModelConnected] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingModel, setIsTestingModel] = useState<boolean>(false);
  
  // Load settings on initial render
  useEffect(() => {
    const storedOllamaUrl = getOllamaUrl();
    const storedOllamaModel = getOllamaModel();
    
    if (storedOllamaUrl) {
      setOllamaUrlState(storedOllamaUrl);
    }
    
    if (storedOllamaModel) {
      setOllamaModelState(storedOllamaModel);
    }
    
    updateApiConfigStatus(storedOllamaUrl);
    
    // Check Ollama connection if URL is available
    if (storedOllamaUrl) {
      checkOllamaConnection().then(connected => {
        if (connected && storedOllamaModel) {
          checkOllamaModelConnection(storedOllamaModel);
        }
      });
    }
  }, []);
  
  const updateApiConfigStatus = (url: string | null) => {
    setHasApiConfig(!!url);
  };
  
  const checkOllamaConnection = async (): Promise<boolean> => {
    if (!ollamaUrl) return false;
    
    try {
      const isConnected = await checkOllamaIsRunning(ollamaUrl);
      setIsOllamaConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Error checking Ollama connection:', error);
      setIsOllamaConnected(false);
      return false;
    }
  };
  
  const checkOllamaModelConnection = async (modelName?: string): Promise<boolean> => {
    const model = modelName || ollamaModel;
    if (!ollamaUrl || !model) return false;
    
    try {
      const response = await fetch(`${ollamaUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: model })
      });
      
      const isConnected = response.ok;
      setIsOllamaModelConnected(isConnected);
      return isConnected;
    } catch (error) {
      console.error('Error checking Ollama model connection:', error);
      setIsOllamaModelConnected(false);
      return false;
    }
  };

  const testOllamaModel = async (modelName: string): Promise<string> => {
    setIsTestingModel(true);
    setTestResponse(null);
    
    try {
      const response = await testOllamaModelConnection(ollamaUrl, modelName);
      setTestResponse(response);
      setIsOllamaModelConnected(true);
      return response;
    } catch (error) {
      console.error('Error testing Ollama model:', error);
      setIsOllamaModelConnected(false);
      throw error;
    } finally {
      setIsTestingModel(false);
    }
  };
  
  const setApiProviderValue = (_provider: ApiProvider) => {
    // No-op as we only use Ollama
  };
  
  const setOllamaUrlValue = (url: string) => {
    setOllamaUrl(url);
    setOllamaUrlState(url);
    updateApiConfigStatus(url);
    
    // Check connection with the new URL
    checkOllamaConnection().then(connected => {
      if (connected) {
        checkOllamaModelConnection();
      }
    });
  };
  
  const setOllamaModelValue = (model: string) => {
    setOllamaModel(model);
    setOllamaModelState(model);
    
    if (isOllamaConnected) {
      checkOllamaModelConnection(model);
    }
  };
  
  return (
    <SettingsContext.Provider value={{
      apiProvider,
      setApiProviderValue,
      ollamaUrl,
      setOllamaUrlValue,
      ollamaModel,
      setOllamaModelValue,
      hasApiConfig,
      isOllamaConnected,
      isOllamaModelConnected,
      testResponse,
      checkOllamaConnection,
      checkOllamaModelConnection,
      testOllamaModel,
      isTestingModel
    }}>
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
