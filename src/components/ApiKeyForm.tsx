
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import ModelSelector from '@/components/ModelSelector';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const ApiKeyForm: React.FC = () => {
  const { 
    apiProvider, 
    setApiProvider,
    ollamaUrl, 
    setOllamaUrl,
    groqApiKey,
    setGroqApiKey,
    checkOllamaConnection,
    checkGroqConnection,
    isOllamaConnected,
    isOllamaModelConnected,
    isGroqConnected, 
    isGroqModelConnected
  } = useSettings();
  const { toast } = useToast();

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [temporaryOllamaUrl, setTemporaryOllamaUrl] = useState(ollamaUrl);
  const [temporaryGroqApiKey, setTemporaryGroqApiKey] = useState(groqApiKey);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      if (apiProvider === 'ollama') {
        const result = await checkOllamaConnection(temporaryOllamaUrl);
        if (result) {
          toast({
            title: "Connection Successful",
            description: "Successfully connected to Ollama server.",
            variant: "default",
          });
          setOllamaUrl(temporaryOllamaUrl);
        } else {
          toast({
            title: "Connection Failed",
            description: "Could not connect to Ollama server. Please check the URL.",
            variant: "destructive",
          });
        }
      } else {
        const result = await checkGroqConnection(temporaryGroqApiKey);
        if (result) {
          toast({
            title: "Connection Successful",
            description: "Successfully connected to Groq API.",
            variant: "default",
          });
          setGroqApiKey(temporaryGroqApiKey);
        } else {
          toast({
            title: "Connection Failed",
            description: "Could not connect to Groq API. Please check your API key.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Configuration</CardTitle>
        <CardDescription>Configure connection to your preferred LLM provider</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={apiProvider} onValueChange={(value) => setApiProvider(value as 'ollama' | 'groq')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ollama">Ollama (Local)</TabsTrigger>
            <TabsTrigger value="groq">Groq (Cloud)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ollama">
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="ollama-url">Ollama URL</Label>
                <Input
                  id="ollama-url"
                  placeholder="http://localhost:11434"
                  value={temporaryOllamaUrl}
                  onChange={(e) => setTemporaryOllamaUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <ModelSelector />
              
              {isOllamaConnected && isOllamaModelConnected && (
                <Alert className="bg-green-50 border-green-600">
                  <Check className="h-5 w-5 text-green-600" />
                  <AlertTitle>Connected to Ollama</AlertTitle>
                  <AlertDescription>
                    Successfully connected to Ollama server and model.
                  </AlertDescription>
                </Alert>
              )}
              
              {ollamaUrl && !isOllamaConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>
                    Cannot connect to Ollama server. Please check the URL and ensure Ollama is running.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="groq">
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="groq-api-key">Groq API Key</Label>
                <Input
                  id="groq-api-key"
                  placeholder="gsk_..."
                  type="password"
                  value={temporaryGroqApiKey}
                  onChange={(e) => setTemporaryGroqApiKey(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <ModelSelector />
              
              {isGroqConnected && isGroqModelConnected && (
                <Alert className="bg-green-50 border-green-600">
                  <Check className="h-5 w-5 text-green-600" />
                  <AlertTitle>Connected to Groq</AlertTitle>
                  <AlertDescription>
                    Successfully connected to Groq API and model.
                  </AlertDescription>
                </Alert>
              )}
              
              {groqApiKey && !isGroqConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-5 w-5" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>
                    Cannot connect to Groq API. Please check your API key.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleTestConnection} disabled={isTestingConnection}>
          {isTestingConnection ? "Testing..." : "Test and Save Configuration"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
