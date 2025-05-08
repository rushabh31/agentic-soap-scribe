
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/contexts/SettingsContext';
import { CheckCircle, Key, Server } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiProvider } from '@/services/apiService';
import { Label } from '@/components/ui/label';

const ApiKeyForm: React.FC = () => {
  const { 
    apiKey, 
    setApiKeyValue, 
    apiProvider, 
    setApiProviderValue, 
    ollamaUrl, 
    setOllamaUrlValue, 
    hasApiConfig 
  } = useSettings();
  
  const [inputKey, setInputKey] = useState(apiKey);
  const [inputProvider, setInputProvider] = useState<ApiProvider>(apiProvider);
  const [inputOllamaUrl, setInputOllamaUrl] = useState(ollamaUrl);
  const [isEditing, setIsEditing] = useState(!hasApiConfig);

  const handleSave = () => {
    setApiProviderValue(inputProvider);
    
    if (inputProvider === 'groq') {
      setApiKeyValue(inputKey);
    } else if (inputProvider === 'ollama') {
      setOllamaUrlValue(inputOllamaUrl);
    }
    
    setIsEditing(false);
  };

  const isConfigValid = () => {
    if (inputProvider === 'groq') {
      return !!inputKey.trim();
    } else if (inputProvider === 'ollama') {
      return !!inputOllamaUrl.trim();
    }
    return false;
  };

  if (!isEditing && hasApiConfig) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            API Configuration Complete
          </CardTitle>
          <CardDescription>
            {apiProvider === 'groq' 
              ? 'Your Groq API key is saved securely in your browser\'s local storage.'
              : 'Your Ollama URL configuration is saved in your browser\'s local storage.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">
            Current provider: <span className="text-primary">{apiProvider === 'groq' ? 'Groq' : 'Ollama'}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Change Configuration
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Configure AI Provider
        </CardTitle>
        <CardDescription>
          Select and configure your preferred AI provider for processing transcripts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiProvider">Select Provider</Label>
            <Select
              value={inputProvider}
              onValueChange={(value) => setInputProvider(value as ApiProvider)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select API Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="groq">Groq API</SelectItem>
                <SelectItem value="ollama">Ollama (Local)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inputProvider === 'groq' && (
            <div className="space-y-2">
              <Label htmlFor="apiKey">Groq API Key</Label>
              <Input
                id="apiKey"
                placeholder="Enter your Groq API key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                type="password"
              />
              <div className="text-sm text-muted-foreground">
                Don't have a Groq API key? Get one at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-medical-primary hover:underline">console.groq.com</a>
              </div>
            </div>
          )}

          {inputProvider === 'ollama' && (
            <div className="space-y-2">
              <Label htmlFor="ollamaUrl" className="flex items-center gap-2">
                <Server className="h-4 w-4" /> Ollama URL
              </Label>
              <Input
                id="ollamaUrl"
                placeholder="http://localhost:11434"
                value={inputOllamaUrl}
                onChange={(e) => setInputOllamaUrl(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                Ollama must be running locally or accessible at the URL above
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave}
          disabled={!isConfigValid()}
          className="w-full"
        >
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
