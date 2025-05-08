
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import ModelSelector from '@/components/ModelSelector';
import { useSettings } from '@/contexts/SettingsContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

const ApiKeyForm: React.FC = () => {
  const { toast } = useToast();
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    checkOllamaConnection();
    if (groqApiKey) checkGroqConnection();
  }, []);

  const handleApiProviderChange = (value: string) => {
    setApiProvider(value as 'ollama' | 'groq');
  };

  const handleSaveOllamaConfig = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      if (!ollamaUrl.trim()) {
        toast({
          title: "URL Required",
          description: "Please enter the Ollama API URL",
          variant: "destructive",
        });
        return;
      }

      if (!ollamaModel.trim()) {
        toast({
          title: "Model Required",
          description: "Please select an Ollama model",
          variant: "destructive",
        });
        return;
      }

      await checkOllamaConnection(true);
      toast({
        title: "Connection Successful",
        description: `Connected to Ollama at ${ollamaUrl} with model ${ollamaModel}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Ollama server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGroqConfig = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      if (!groqApiKey.trim()) {
        toast({
          title: "API Key Required",
          description: "Please enter your Groq API key",
          variant: "destructive",
        });
        return;
      }

      if (!groqModel.trim()) {
        toast({
          title: "Model Required",
          description: "Please select a Groq model",
          variant: "destructive",
        });
        return;
      }

      await checkGroqConnection(true);
      toast({
        title: "Connection Successful",
        description: `Connected to Groq API with model ${groqModel}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Groq API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
        <CardDescription>
          Configure your LLM provider settings for processing healthcare transcripts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Choose API Provider</Label>
          <RadioGroup 
            value={apiProvider} 
            onValueChange={handleApiProviderChange}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ollama" id="ollama" />
              <Label htmlFor="ollama">Ollama (Local)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="groq" id="groq" />
              <Label htmlFor="groq">Groq Cloud API</Label>
            </div>
          </RadioGroup>
        </div>

        {apiProvider === 'ollama' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ollamaUrl">Ollama Server URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="ollamaUrl"
                  placeholder="http://localhost:11434"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                />
                <div className="w-10 flex items-center justify-center">
                  {isOllamaConnected === true && <Check className="h-5 w-5 text-green-500" />}
                  {isOllamaConnected === false && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ollamaModel">Ollama Model</Label>
              <div className="flex space-x-2">
                <Select value={ollamaModel} onValueChange={setOllamaModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama3">Llama 3 (8B)</SelectItem>
                    <SelectItem value="llama3:latest">Llama 3 (latest)</SelectItem>
                    <SelectItem value="mistral">Mistral</SelectItem>
                    <SelectItem value="gemma:7b">Gemma (7B)</SelectItem>
                    <SelectItem value="phi3:latest">Phi-3 (latest)</SelectItem>
                    <SelectItem value="codellama">CodeLlama</SelectItem>
                    <SelectItem value="orca-mini">Orca Mini</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-10 flex items-center justify-center">
                  {isOllamaModelConnected === true && <Check className="h-5 w-5 text-green-500" />}
                  {isOllamaModelConnected === false && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveOllamaConfig} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection
                </>
              ) : (
                'Test & Save Ollama Configuration'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groqApiKey">Groq API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="groqApiKey"
                  type="password"
                  placeholder="Enter your Groq API key"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                />
                <div className="w-10 flex items-center justify-center">
                  {groqApiKey && isGroqConnected === true && <Check className="h-5 w-5 text-green-500" />}
                  {groqApiKey && isGroqConnected === false && <AlertCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                You can get an API key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Groq Console</a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groqModel">Groq Model</Label>
              <div className="flex space-x-2">
                <Select value={groqModel} onValueChange={setGroqModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama3-8b-8192">Llama 3 8B</SelectItem>
                    <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                    <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                    <SelectItem value="gemma-7b-it">Gemma 7B</SelectItem>
                  </SelectContent>
                </Select>
                <div className="w-10 flex items-center justify-center">
                  {groqApiKey && groqModel && isGroqModelConnected === true && 
                    <Check className="h-5 w-5 text-green-500" />
                  }
                  {groqApiKey && groqModel && isGroqModelConnected === false && 
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  }
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveGroqConfig} 
              disabled={isLoading || !groqApiKey}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection
                </>
              ) : (
                'Test & Save Groq Configuration'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyForm;
