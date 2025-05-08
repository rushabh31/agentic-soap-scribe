
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/contexts/SettingsContext';
import { CheckCircle, Server, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ApiProvider } from '@/services/apiService';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ApiKeyForm: React.FC = () => {
  const { 
    ollamaUrl, 
    setOllamaUrlValue,
    ollamaModel,
    setOllamaModelValue,
    hasApiConfig,
    isOllamaConnected,
    isOllamaModelConnected,
    testResponse,
    checkOllamaConnection,
    testOllamaModel,
    isTestingModel
  } = useSettings();
  
  const [inputOllamaUrl, setInputOllamaUrl] = useState(ollamaUrl);
  const [inputOllamaModel, setInputOllamaModel] = useState(ollamaModel);
  const [isEditing, setIsEditing] = useState(!hasApiConfig);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<{ value: string; label: string }[]>([]);
  const [testError, setTestError] = useState<string | null>(null);

  // Check Ollama connection when component mounts
  useEffect(() => {
    if (inputOllamaUrl) {
      checkOllamaStatus();
    }
  }, []);

  // Fetch Ollama models when connected
  useEffect(() => {
    if (isOllamaConnected) {
      fetchOllamaModels();
    }
  }, [isOllamaConnected, inputOllamaUrl]);

  const checkOllamaStatus = async () => {
    setIsCheckingConnection(true);
    await checkOllamaConnection();
    setIsCheckingConnection(false);
  };

  const fetchOllamaModels = async () => {
    if (!inputOllamaUrl) return;
    
    try {
      const response = await fetch(`${inputOllamaUrl}/api/tags`);
      
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
      setOllamaModels([
        { value: 'llama3', label: 'Llama 3 (default)' }
      ]);
    }
  };

  const handleSave = () => {
    setOllamaUrlValue(inputOllamaUrl);
    setOllamaModelValue(inputOllamaModel);
    setIsEditing(false);
  };

  const handleTestModel = async () => {
    setTestError(null);
    
    try {
      await testOllamaModel(inputOllamaModel);
    } catch (error) {
      setTestError(`Failed to connect to Ollama model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const isConfigValid = () => {
    return !!inputOllamaUrl.trim() && !!inputOllamaModel.trim() && isOllamaModelConnected;
  };

  const getConnectionStatusDot = () => {
    if (isCheckingConnection) {
      return (
        <div className="flex items-center gap-2 text-sm">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span>Checking connection...</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-sm mt-2">
        <div className={`h-3 w-3 rounded-full ${isOllamaConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isOllamaConnected ? 'Connected to Ollama' : 'Cannot connect to Ollama'}</span>
      </div>
    );
  };

  const getModelStatusDot = () => {
    if (!isOllamaConnected) return null;
    
    if (isTestingModel) {
      return (
        <div className="flex items-center gap-2 text-sm mt-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span>Testing model...</span>
        </div>
      );
    }
    
    if (testError) {
      return (
        <div className="flex items-center gap-2 text-sm mt-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span>Model test failed</span>
        </div>
      );
    }
    
    if (testResponse) {
      return (
        <div className="flex items-center gap-2 text-sm mt-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span>Model test successful</span>
        </div>
      );
    }
    
    return null;
  };

  if (!isEditing && hasApiConfig) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Ollama Configuration Complete
          </CardTitle>
          <CardDescription>
            Your Ollama configuration is saved in your browser's local storage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">            
            <div className="flex items-center gap-2 mt-2">
              <div className={`h-3 w-3 rounded-full ${isOllamaConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isOllamaConnected ? 'Connected to Ollama' : 'Cannot connect to Ollama'}</span>
              {!isOllamaConnected && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2" 
                  onClick={checkOllamaStatus}
                >
                  Retry
                </Button>
              )}
            </div>
            
            {isOllamaConnected && (
              <div className="flex items-center gap-2 mt-2">
                <div className={`h-3 w-3 rounded-full ${isOllamaModelConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">
                  {isOllamaModelConnected 
                    ? `Model "${ollamaModel}" is ready` 
                    : `Model "${ollamaModel}" is not available`}
                </span>
              </div>
            )}
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
          <Server className="h-5 w-5" />
          Configure Ollama
        </CardTitle>
        <CardDescription>
          Configure your Ollama instance for processing transcripts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
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
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Ollama must be running locally or accessible at the URL above
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkOllamaStatus}
                  disabled={isCheckingConnection || !inputOllamaUrl.trim()}
                >
                  Test Connection
                </Button>
              </div>
              {getConnectionStatusDot()}
            </div>

            {isOllamaConnected && (
              <div className="space-y-2">
                <Label htmlFor="ollamaModel">Select Model</Label>
                <div className="flex gap-2">
                  <Select
                    value={inputOllamaModel}
                    onValueChange={(value) => setInputOllamaModel(value)}
                    disabled={!isOllamaConnected || ollamaModels.length === 0}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select Ollama model" />
                    </SelectTrigger>
                    <SelectContent>
                      {ollamaModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline"
                    onClick={fetchOllamaModels}
                    disabled={!isOllamaConnected}
                    size="icon"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Select a model from your local Ollama instance
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTestModel}
                    disabled={!isOllamaConnected || !inputOllamaModel || isTestingModel}
                  >
                    Test Model
                  </Button>
                </div>
                {getModelStatusDot()}
                
                {testError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{testError}</AlertDescription>
                  </Alert>
                )}
                
                {testResponse && (
                  <div className="mt-4 p-3 bg-muted rounded-md text-sm">
                    <div className="font-medium mb-1">Model response:</div>
                    <p className="italic">{testResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
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
