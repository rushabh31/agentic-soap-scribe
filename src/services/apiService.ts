
const API_PROVIDER_LOCAL_STORAGE = 'API_PROVIDER';
const OLLAMA_URL_LOCAL_STORAGE = 'OLLAMA_URL';
const OLLAMA_MODEL_LOCAL_STORAGE = 'OLLAMA_MODEL';

export type ApiProvider = 'ollama';

export interface ApiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ApiResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage?: {
    total_tokens: number;
  };
}

export const getApiProvider = (): ApiProvider => {
  return 'ollama';
};

export const setApiProvider = (provider: ApiProvider): void => {
  localStorage.setItem(API_PROVIDER_LOCAL_STORAGE, provider);
};

export const getOllamaUrl = (): string => {
  return localStorage.getItem(OLLAMA_URL_LOCAL_STORAGE) || 'http://localhost:11434';
};

export const setOllamaUrl = (url: string): void => {
  localStorage.setItem(OLLAMA_URL_LOCAL_STORAGE, url);
};

export const getOllamaModel = (): string => {
  return localStorage.getItem(OLLAMA_MODEL_LOCAL_STORAGE) || 'llama3';
};

export const setOllamaModel = (model: string): void => {
  localStorage.setItem(OLLAMA_MODEL_LOCAL_STORAGE, model);
};

export const callApi = async (
  messages: ApiMessage[]
): Promise<string> => {
  return callOllamaAPI(messages);
};

// Test the connection to Ollama by generating a simple response
export const testOllamaModelConnection = async (url: string, model: string): Promise<string> => {
  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: 'Generate a short test response to verify the connection.'
        }],
        options: {
          temperature: 0.2
        },
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error testing Ollama model connection:', error);
    throw error;
  }
};

// Check if Ollama is running by checking the version endpoint
export const checkOllamaIsRunning = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/api/version`, {
      method: 'GET'
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking if Ollama is running:', error);
    return false;
  }
};

const callOllamaAPI = async (
  messages: ApiMessage[]
): Promise<string> => {
  const ollamaUrl = getOllamaUrl();
  const ollamaModel = getOllamaModel();
  
  if (!ollamaUrl) {
    throw new Error('No Ollama URL configured. Please enter your Ollama URL in settings.');
  }

  if (!ollamaModel) {
    throw new Error('No Ollama model selected. Please select a model in settings.');
  }

  try {
    // First check if Ollama is running
    const isRunning = await checkOllamaIsRunning(ollamaUrl);
    if (!isRunning) {
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Please make sure Ollama is running.`);
    }
    
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: messages,
        options: {
          temperature: 0.2
        },
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
};
