
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useSettings } from '@/contexts/SettingsContext';
import ModelSelector from './ModelSelector';
import { CheckCircle, XCircle } from 'lucide-react';

const ApiKeyForm: React.FC = () => {
  const { 
    apiProvider, 
    setApiProvider,
    ollamaUrl, 
    setOllamaUrl, 
    ollamaModel,
    setOllamaModel,
    groqApiKey,
    setGroqApiKey,
    groqModel,
    setGroqModel,
    isOllamaConnected,
    isOllamaModelConnected,
    isGroqConnected,
    isGroqModelConnected,
    checkOllamaConnection,
    checkGroqConnection
  } = useSettings();

  const [selectedApiProvider, setSelectedApiProvider] = useState<'ollama' | 'groq'>(apiProvider);

  const handleProviderChange = (value: 'ollama' | 'groq') => {
    setSelectedApiProvider(value);
    setApiProvider(value); 
  };

  const handleTestOllamaConnection = async () => {
    await checkOllamaConnection(true);
  };

  const handleTestGroqConnection = async () => {
    await checkGroqConnection(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>
          Configure your AI provider settings to process healthcare transcripts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          defaultValue={apiProvider} 
          value={selectedApiProvider}
          onValueChange={handleProviderChange as (value: string) => void}
          className="flex flex-col space-y-1 mb-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ollama" id="ollama" />
            <Label htmlFor="ollama">Ollama (Local)</Label>
            <Badge variant="outline" className="ml-2">Local deployment</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="groq" id="groq" />
            <Label htmlFor="groq">Groq API</Label>
            <Badge variant="outline" className="ml-2">Cloud API</Badge>
          </div>
        </RadioGroup>

        <Tabs defaultValue={apiProvider} value={selectedApiProvider}>
          <TabsContent value="ollama" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ollama-url">Ollama URL</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="ollama-url"
                  placeholder="http://localhost:11434"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="shrink-0"
                  onClick={handleTestOllamaConnection}
                >
                  Test
                </Button>
              </div>
              <div className="text-xs flex items-center mt-1">
                {isOllamaConnected === true && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Connected to Ollama
                  </span>
                )}
                {isOllamaConnected === false && (
                  <span className="text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" /> Cannot connect to Ollama
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ollama-model">Ollama Model</Label>
              <ModelSelector 
                provider="ollama" 
                value={ollamaModel} 
                onChange={setOllamaModel}
                isConnected={isOllamaConnected === true}
              />
              <div className="text-xs flex items-center mt-1">
                {isOllamaModelConnected === true && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Model available
                  </span>
                )}
                {isOllamaModelConnected === false && isOllamaConnected === true && (
                  <span className="text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" /> Model not found
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="groq" className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="groq-api-key">Groq API Key</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="groq-api-key"
                  placeholder="gsk_..."
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="shrink-0"
                  onClick={handleTestGroqConnection}
                >
                  Test
                </Button>
              </div>
              <div className="text-xs flex items-center mt-1">
                {isGroqConnected === true && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> API key valid
                  </span>
                )}
                {isGroqConnected === false && groqApiKey && (
                  <span className="text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" /> API key invalid
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="groq-model">Groq Model</Label>
              <ModelSelector 
                provider="groq" 
                value={groqModel} 
                onChange={setGroqModel}
                isConnected={Boolean(groqApiKey)}
              />
              <div className="text-xs flex items-center mt-1">
                {isGroqModelConnected === true && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Model available
                  </span>
                )}
                {isGroqModelConnected === false && groqApiKey && (
                  <span className="text-red-600 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" /> Model not available
                  </span>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          {selectedApiProvider === 'ollama' 
            ? 'Make sure Ollama is running locally with the selected model.' 
            : 'Your API key is stored in browser storage and is not sent to any server.'}
        </p>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
