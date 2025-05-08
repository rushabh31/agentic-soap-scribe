
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getApiKey, setApiKey, getApiProvider, setApiProvider, getOllamaUrl, setOllamaUrl, ApiProvider } from '@/services/apiService';

interface SettingsContextType {
  apiKey: string;
  setApiKeyValue: (key: string) => void;
  apiProvider: ApiProvider;
  setApiProviderValue: (provider: ApiProvider) => void;
  ollamaUrl: string;
  setOllamaUrlValue: (url: string) => void;
  hasApiConfig: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [apiProvider, setApiProviderState] = useState<ApiProvider>('groq');
  const [ollamaUrl, setOllamaUrlState] = useState<string>('http://localhost:11434');
  const [hasApiConfig, setHasApiConfig] = useState<boolean>(false);
  
  // Load settings on initial render
  useEffect(() => {
    const storedKey = getApiKey();
    const storedProvider = getApiProvider();
    const storedOllamaUrl = getOllamaUrl();
    
    if (storedKey) {
      setApiKeyState(storedKey);
    }
    
    if (storedProvider) {
      setApiProviderState(storedProvider);
    }
    
    if (storedOllamaUrl) {
      setOllamaUrlState(storedOllamaUrl);
    }
    
    updateApiConfigStatus(storedKey, storedProvider, storedOllamaUrl);
  }, []);
  
  const updateApiConfigStatus = (key: string | null, provider: ApiProvider, url: string | null) => {
    if (provider === 'groq') {
      setHasApiConfig(!!key);
    } else if (provider === 'ollama') {
      setHasApiConfig(!!url);
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
  };
  
  const setOllamaUrlValue = (url: string) => {
    setOllamaUrl(url);
    setOllamaUrlState(url);
    updateApiConfigStatus(apiKey, apiProvider, url);
  };
  
  return (
    <SettingsContext.Provider value={{
      apiKey,
      setApiKeyValue,
      apiProvider,
      setApiProviderValue,
      ollamaUrl,
      setOllamaUrlValue,
      hasApiConfig
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
