
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';
import { Cpu, RefreshCw, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface ModelOption {
  value: string;
  label: string;
}

const ModelSelector: React.FC = () => {
  const { ollamaUrl, ollamaModel, setOllamaModel, checkOllamaConnection, isOllamaModelConnected } = useSettings();
  const [ollamaModels, setOllamaModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customModelInput, setCustomModelInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

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
        { value: 'llama3.1-8b-instant', label: 'Llama 3.1 8B Instant (default)' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      setOllamaModel(value);
      checkOllamaConnection(true);
      setShowCustomInput(false);
    }
  };

  const handleCustomModelSubmit = () => {
    if (customModelInput.trim()) {
      setOllamaModel(customModelInput.trim());
      checkOllamaConnection(true);
      
      // Add the custom model to the list if it's not already there
      if (!ollamaModels.some(model => model.value === customModelInput.trim())) {
        setOllamaModels([
          ...ollamaModels,
          { value: customModelInput.trim(), label: customModelInput.trim() }
        ]);
      }
      setShowCustomInput(false);
      toast.success(`Model set to ${customModelInput.trim()}`);
    }
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
          
          {!showCustomInput ? (
            <>
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
                  <SelectItem value="llama3.1-8b-instant">Llama 3.1 8B Instant</SelectItem>
                  <SelectItem value="custom">Custom Model...</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center justify-between mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCustomInput(true)}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Enter Custom Model
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Enter model name (e.g. llama3.1-8b-instant)"
                value={customModelInput}
                onChange={(e) => setCustomModelInput(e.target.value)}
                className="w-full"
                autoFocus
              />
              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleCustomModelSubmit}
                  disabled={!customModelInput.trim()}
                  className="flex-1"
                >
                  Set Model
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCustomInput(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
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
