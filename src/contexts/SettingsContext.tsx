
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  getApiProvider, setApiProvider, 
  getOllamaUrl, setOllamaUrl, 
  getOllamaModel, setOllamaModel, 
  getGroqApiKey, setGroqApiKey,
  getGroqModel, setGroqModel,
  ApiProvider, 
  testOllamaModelConnection, 
  checkOllamaIsRunning,
  testGroqModelConnection
} from '@/services/apiService';

interface SettingsContextType {
  apiProvider: ApiProvider;
  setApiProviderValue: (provider: ApiProvider) => void;
  // Ollama settings
  ollamaUrl: string;
  setOllamaUrlValue: (url: string) => void;
  ollamaModel: string;
  setOllamaModelValue: (model: string) => void;
  isOllamaConnected: boolean;
  isOllamaModelConnected: boolean;
  checkOllamaConnection: () => Promise<boolean>;
  checkOllamaModelConnection: (model?: string) => Promise<boolean>;
  testOllamaModel: (model: string) => Promise<string>;
  // Groq settings
  groqApiKey: string;
  setGroqApiKeyValue: (apiKey: string) => void;
  groqModel: string;
  setGroqModelValue: (model: string) => void;
  isGroqConnected: boolean;
  testGroqModel: (model: string) => Promise<string>;
  // Common
  hasApiConfig: boolean;
  testResponse: string | null;
  isTestingModel: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiProvider, setApiProviderState] = useState<ApiProvider>(getApiProvider());
  // Ollama states
  const [ollamaUrl, setOllamaUrlState] = useState<string>(getOllamaUrl());
  const [ollamaModel, setOllamaModelState] = useState<string>(getOllamaModel());
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [isOllamaModelConnected, setIsOllamaModelConnected] = useState<boolean>(false);
  // Groq states
  const [groqApiKey, setGroqApiKeyState] = useState<string>(getGroqApiKey());
  const [groqModel, setGroqModelState] = useState<string>(getGroqModel());
  const [isGroqConnected, setIsGroqConnected] = useState<boolean>(false);
  // Common states
  const [hasApiConfig, setHasApiConfig] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTestingModel, setIsTestingModel] = useState<boolean>(false);
  
  // Load settings on initial render
  useEffect(() => {
    const storedProvider = getApiProvider();
    const storedOllamaUrl = getOllamaUrl();
    const storedOllamaModel = getOllamaModel();
    const storedGroqApiKey = getGroqApiKey();
    const storedGroqModel = getGroqModel();
    
    setApiProviderState(storedProvider);
    
    if (storedOllamaUrl) {
      setOllamaUrlState(storedOllamaUrl);
    }
    
    if (storedOllamaModel) {
      setOllamaModelState(storedOllamaModel);
    }
    
    if (storedGroqApiKey) {
      setGroqApiKeyState(storedGroqApiKey);
    }
    
    if (storedGroqModel) {
      setGroqModelState(storedGroqModel);
    }
    
    updateApiConfigStatus(storedProvider, storedOllamaUrl, storedGroqApiKey);
    
    // Check API connections based on provider
    if (storedProvider === 'ollama' && storedOllamaUrl) {
      checkOllamaConnection().then(connected => {
        if (connected && storedOllamaModel) {
          checkOllamaModelConnection(storedOllamaModel);
        }
      });
    } else if (storedProvider === 'groq' && storedGroqApiKey) {
      setIsGroqConnected(!!storedGroqApiKey);
    }
  }, []);
  
  const updateApiConfigStatus = (
    provider: ApiProvider, 
    ollamaUrlValue: string | null,
    groqApiKeyValue: string | null
  ) => {
    if (provider === 'ollama') {
      setHasApiConfig(!!ollamaUrlValue);
    } else if (provider === 'groq') {
      setHasApiConfig(!!groqApiKeyValue);
    }
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
  
  const testGroqModel = async (modelName: string): Promise<string> => {
    setIsTestingModel(true);
    setTestResponse(null);
    
    try {
      const response = await testGroqModelConnection(groqApiKey, modelName);
      setTestResponse(response);
      setIsGroqConnected(true);
      return response;
    } catch (error) {
      console.error('Error testing Groq model:', error);
      setIsGroqConnected(false);
      throw error;
    } finally {
      setIsTestingModel(false);
    }
  };
  
  const setApiProviderValue = (provider: ApiProvider) => {
    setApiProvider(provider);
    setApiProviderState(provider);
    
    // Update API configuration status based on the new provider
    if (provider === 'ollama') {
      setHasApiConfig(!!ollamaUrl);
      if (ollamaUrl) {
        checkOllamaConnection();
      }
    } else if (provider === 'groq') {
      setHasApiConfig(!!groqApiKey);
      setIsGroqConnected(!!groqApiKey);
    }
  };
  
  const setOllamaUrlValue = (url: string) => {
    setOllamaUrl(url);
    setOllamaUrlState(url);
    
    if (apiProvider === 'ollama') {
      updateApiConfigStatus('ollama', url, groqApiKey);
    }
    
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
  
  const setGroqApiKeyValue = (apiKey: string) => {
    setGroqApiKey(apiKey);
    setGroqApiKeyState(apiKey);
    
    if (apiProvider === 'groq') {
      updateApiConfigStatus('groq', ollamaUrl, apiKey);
      setIsGroqConnected(!!apiKey);
    }
  };
  
  const setGroqModelValue = (model: string) => {
    setGroqModel(model);
    setGroqModelState(model);
  };
  
  return (
    <SettingsContext.Provider value={{
      apiProvider,
      setApiProviderValue,
      // Ollama
      ollamaUrl,
      setOllamaUrlValue,
      ollamaModel,
      setOllamaModelValue,
      isOllamaConnected,
      isOllamaModelConnected,
      checkOllamaConnection,
      checkOllamaModelConnection,
      testOllamaModel,
      // Groq
      groqApiKey,
      setGroqApiKeyValue,
      groqModel,
      setGroqModelValue,
      isGroqConnected,
      testGroqModel,
      // Common
      hasApiConfig,
      testResponse,
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
