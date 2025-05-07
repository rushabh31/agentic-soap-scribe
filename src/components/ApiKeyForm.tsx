
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSettings } from '@/contexts/SettingsContext';
import { CheckCircle, Key } from 'lucide-react';

const ApiKeyForm: React.FC = () => {
  const { apiKey, setApiKeyValue, hasApiKey } = useSettings();
  const [inputKey, setInputKey] = useState(apiKey);
  const [isEditing, setIsEditing] = useState(!hasApiKey);

  const handleSave = () => {
    setApiKeyValue(inputKey);
    setIsEditing(false);
  };

  if (!isEditing && hasApiKey) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            API Key Configured
          </CardTitle>
          <CardDescription>
            Your Groq API key is saved securely in your browser's local storage.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Change API Key
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
          Configure Groq API Key
        </CardTitle>
        <CardDescription>
          This application requires a Groq API key to function. Your key is stored securely in your browser's local storage and is never sent to our server.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              id="apiKey"
              placeholder="Enter your Groq API key"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              type="password"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Don't have a Groq API key? Get one at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-medical-primary hover:underline">console.groq.com</a>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSave}
          disabled={!inputKey.trim()}
          className="w-full"
        >
          Save API Key
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
