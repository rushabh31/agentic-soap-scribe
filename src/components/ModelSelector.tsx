
import React, { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ModelSelector = () => {
  const { 
    apiProvider, 
    ollamaModel,
    setOllamaModel,
    groqModel,
    setGroqModel,
    isOllamaModelConnected,
    isGroqModelConnected
  } = useSettings();
  
  const [customOllamaModel, setCustomOllamaModel] = useState<string>(ollamaModel || '');
  const [customGroqModel, setCustomGroqModel] = useState<string>(groqModel || '');

  const handleOllamaModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomOllamaModel(value);
    setOllamaModel(value);
  };

  const handleGroqModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomGroqModel(value);
    setGroqModel(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="model-selection">
        {apiProvider === 'ollama' ? 'Ollama Model' : 'Groq Model'}
      </Label>
      
      {apiProvider === 'ollama' ? (
        <Input
          id="model-selection"
          value={customOllamaModel}
          onChange={handleOllamaModelChange}
          placeholder="llama3.1-8b-instant"
          className="mt-1"
        />
      ) : (
        <Input
          id="model-selection"
          value={customGroqModel}
          onChange={handleGroqModelChange}
          placeholder="llama3-8b-8192"
          className="mt-1"
        />
      )}
      
      <p className="text-xs text-gray-500 mt-1">
        {apiProvider === 'ollama' 
          ? `${isOllamaModelConnected ? '✓ Connected' : 'Specify the exact model name to use with Ollama'}` 
          : `${isGroqModelConnected ? '✓ Connected' : 'Specify the exact model name to use with Groq API'}`}
      </p>
    </div>
  );
};

export default ModelSelector;
