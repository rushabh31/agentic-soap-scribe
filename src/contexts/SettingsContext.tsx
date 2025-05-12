
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getApiKey, setApiKey } from '@/services/groqAPI';

interface SettingsContextType {
  apiKey: string;
  setApiKeyValue: (key: string) => void;
  hasApiKey: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Load API key on initial render
  useEffect(() => {
    const storedKey = getApiKey();
    if (storedKey) {
      setApiKeyState(storedKey);
      setHasApiKey(true);
    }
  }, []);
  
  const setApiKeyValue = (key: string) => {
    setApiKey(key);
    setApiKeyState(key);
    setHasApiKey(!!key);
  };
  
  return (
    <SettingsContext.Provider value={{
      apiKey,
      setApiKeyValue,
      hasApiKey
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
