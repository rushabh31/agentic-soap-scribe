
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import { Cpu } from 'lucide-react';

interface ModelOption {
  value: string;
  label: string;
  provider: 'groq' | 'ollama';
}

// Predefined model options
const GROQ_MODELS: ModelOption[] = [
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant', provider: 'groq' },
  { value: 'llama-3.1-8b', label: 'Llama 3.1 8B', provider: 'groq' },
  { value: 'llama-3.1-70b', label: 'Llama 3.1 70B', provider: 'groq' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', provider: 'groq' },
];

// We'll fetch Ollama models dynamically
const ModelSelector: React.FC = () => {
  const { apiProvider, ollamaUrl } = useSettings();
  const [selectedModel, setSelectedModel] = useState<string>('llama-3.1-8b-instant');
  const [ollamaModels, setOllamaModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available Ollama models when provider is Ollama
  useEffect(() => {
    if (apiProvider === 'ollama') {
      fetchOllamaModels();
    }
  }, [apiProvider, ollamaUrl]);

  const fetchOllamaModels = async () => {
    if (!ollamaUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${ollamaUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Ollama models');
      }
      
      const data = await response.json();
      
      if (data.models) {
        const formattedModels = data.models.map((model: any) => ({
          value: model.name,
          label: model.name,
          provider: 'ollama'
        }));
        setOllamaModels(formattedModels);
      }
    } catch (err) {
      console.error('Error fetching Ollama models:', err);
      setError('Could not connect to Ollama server. Please ensure it\'s running.');
      setOllamaModels([
        { value: 'llama3', label: 'Llama 3 (default)', provider: 'ollama' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine which models to show based on the selected provider
  const availableModels = apiProvider === 'groq' ? GROQ_MODELS : ollamaModels;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Model Selection
        </CardTitle>
        <CardDescription>
          Choose which AI model to use for processing transcripts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="model-selector">Select Model</Label>
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}
          
          {isLoading && (
            <div className="text-sm text-muted-foreground mt-2">
              Loading available models...
            </div>
          )}
          
          <div className="text-sm text-muted-foreground mt-2">
            {apiProvider === 'groq' 
              ? 'Using Groq API with cloud-hosted models' 
              : 'Using locally hosted Ollama models'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelSelector;
