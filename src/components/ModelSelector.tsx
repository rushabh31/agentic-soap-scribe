
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import { Cpu, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ModelOption {
  value: string;
  label: string;
}

const ModelSelector: React.FC = () => {
  const { ollamaUrl, ollamaModel, setOllamaModel, checkOllamaConnection, isOllamaModelConnected } = useSettings();
  const [ollamaModels, setOllamaModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available Ollama models when component mounts or URL changes
  useEffect(() => {
    if (ollamaUrl) {
      fetchOllamaModels();
    }
  }, [ollamaUrl]);

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
          label: model.name
        }));
        setOllamaModels(formattedModels);
      }
    } catch (err) {
      console.error('Error fetching Ollama models:', err);
      setError('Could not connect to Ollama server. Please ensure it\'s running.');
      setOllamaModels([
        { value: 'llama3', label: 'Llama 3 (default)' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (value: string) => {
    setOllamaModel(value);
    checkOllamaConnection(true);
  };

  const handleRefreshModels = () => {
    fetchOllamaModels();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Ollama Model Selection
        </CardTitle>
        <CardDescription>
          Choose which Ollama model to use for processing transcripts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="model-selector">Select Model</Label>
            <Button variant="ghost" size="sm" onClick={handleRefreshModels}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
          
          <Select
            value={ollamaModel}
            onValueChange={handleModelChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {ollamaModels.map((model) => (
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
          
          <div className="flex items-center gap-2 mt-2">
            <div className={`h-3 w-3 rounded-full ${isOllamaModelConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">
              {isOllamaModelConnected 
                ? `Model ${ollamaModel} is available` 
                : `Model ${ollamaModel} is not available`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelSelector;
