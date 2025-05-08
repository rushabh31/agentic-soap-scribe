
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getApiKey, setApiKey, getApiProvider, setApiProvider, getOllamaUrl, setOllamaUrl, ApiProvider, getOllamaModel, setOllamaModel, testOllamaModelConnection } from '@/services/apiService';

interface SettingsContextType {
  apiKey: string;
  setApiKeyValue: (key: string) => void;
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
  const [apiKey, setApiKeyState] = useState<string>('');
  const [apiProvider, setApiProviderState] = useState<ApiProvider>('groq');
  const [ollamaUrl, setOllamaUrlState] = useState<string>('http://localhost:11434');
  const [ollamaModel, setOllamaModelState] = useState<string>('llama3');
  const [hasApiConfig, setHasApiConfig] = useState<boolean>(false);
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [isOllamaModelConnected, setIsOllamaModelConnected] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingModel, setIsTestingModel] = useState<boolean>(false);
  
  // Load settings on initial render
  useEffect(() => {
    const storedKey = getApiKey();
    const storedProvider = getApiProvider();
    const storedOllamaUrl = getOllamaUrl();
    const storedOllamaModel = getOllamaModel();
    
    if (storedKey) {
      setApiKeyState(storedKey);
    }
    
    if (storedProvider) {
      setApiProviderState(storedProvider);
    }
    
    if (storedOllamaUrl) {
      setOllamaUrlState(storedOllamaUrl);
    }
    
    if (storedOllamaModel) {
      setOllamaModelState(storedOllamaModel);
    }
    
    updateApiConfigStatus(storedKey, storedProvider, storedOllamaUrl);
    
    // Check Ollama connection if it's the selected provider
    if (storedProvider === 'ollama' && storedOllamaUrl) {
      checkOllamaConnection().then(connected => {
        if (connected && storedOllamaModel) {
          checkOllamaModelConnection(storedOllamaModel);
        }
      });
    }
  }, []);
  
  const updateApiConfigStatus = (key: string | null, provider: ApiProvider, url: string | null) => {
    if (provider === 'groq') {
      setHasApiConfig(!!key);
    } else if (provider === 'ollama') {
      setHasApiConfig(!!url);
    }
  };
  
  const checkOllamaConnection = async (): Promise<boolean> => {
    if (!ollamaUrl) return false;
    
    try {
      const response = await fetch(`${ollamaUrl}/api/version`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const isConnected = response.ok;
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
  
  const setApiKeyValue = (key: string) => {
    setApiKey(key);
    setApiKeyState(key);
    updateApiConfigStatus(key, apiProvider, ollamaUrl);
  };
  
  const setApiProviderValue = (provider: ApiProvider) => {
    setApiProvider(provider);
    setApiProviderState(provider);
    updateApiConfigStatus(apiKey, provider, ollamaUrl);
    
    // Check Ollama connection if switching to Ollama
    if (provider === 'ollama') {
      checkOllamaConnection().then(connected => {
        if (connected) {
          checkOllamaModelConnection();
        }
      });
    }
  };
  
  const setOllamaUrlValue = (url: string) => {
    setOllamaUrl(url);
    setOllamaUrlState(url);
    updateApiConfigStatus(apiKey, apiProvider, url);
    
    // Check connection with the new URL if in Ollama mode
    if (apiProvider === 'ollama') {
      checkOllamaConnection().then(connected => {
        if (connected) {
          checkOllamaModelConnection();
        }
      });
    }
  };
  
  const setOllamaModelValue = (model: string) => {
    setOllamaModel(model);
    setOllamaModelState(model);
    
    if (apiProvider === 'ollama' && isOllamaConnected) {
      checkOllamaModelConnection(model);
    }
  };
  
  return (
    <SettingsContext.Provider value={{
      apiKey,
      setApiKeyValue,
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
