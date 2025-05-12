
const API_PROVIDER_LOCAL_STORAGE = 'API_PROVIDER';
const OLLAMA_URL_LOCAL_STORAGE = 'OLLAMA_URL';
const OLLAMA_MODEL_LOCAL_STORAGE = 'OLLAMA_MODEL';
const GROQ_API_KEY_LOCAL_STORAGE = 'GROQ_API_KEY';
const GROQ_MODEL_LOCAL_STORAGE = 'GROQ_MODEL';

export type ApiProvider = {
  apiProvider: 'ollama' | 'groq';
  ollamaUrl?: string;
  ollamaModel?: string;
  groqApiKey?: string;
  groqModel?: string;
};

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
  const provider = localStorage.getItem(API_PROVIDER_LOCAL_STORAGE) as 'ollama' | 'groq' || 'ollama';
  
  return {
    apiProvider: provider,
    ollamaUrl: localStorage.getItem(OLLAMA_URL_LOCAL_STORAGE) || 'http://localhost:11434',
    ollamaModel: localStorage.getItem(OLLAMA_MODEL_LOCAL_STORAGE) || 'llama3',
    groqApiKey: localStorage.getItem(GROQ_API_KEY_LOCAL_STORAGE) || '',
    groqModel: localStorage.getItem(GROQ_MODEL_LOCAL_STORAGE) || 'llama3-8b-8192',
  };
};

export const setApiProvider = (provider: 'ollama' | 'groq'): void => {
  localStorage.setItem(API_PROVIDER_LOCAL_STORAGE, provider);
};

// Ollama related functions
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

// Groq related functions
export const getGroqApiKey = (): string => {
  return localStorage.getItem(GROQ_API_KEY_LOCAL_STORAGE) || '';
};

export const setGroqApiKey = (apiKey: string): void => {
  localStorage.setItem(GROQ_API_KEY_LOCAL_STORAGE, apiKey);
};

export const getGroqModel = (): string => {
  return localStorage.getItem(GROQ_MODEL_LOCAL_STORAGE) || 'llama3-8b-8192';
};

export const setGroqModel = (model: string): void => {
  localStorage.setItem(GROQ_MODEL_LOCAL_STORAGE, model);
};

export const callApi = async (messages: ApiMessage[]): Promise<string> => {
  const config = getApiProvider();
  
  if (config.apiProvider === 'ollama') {
    return callOllamaAPI(messages);
  } else if (config.apiProvider === 'groq') {
    return callGroqAPI(messages);
  } else {
    throw new Error(`Unknown API provider: ${config.apiProvider}`);
  }
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

// Test the connection to Groq
export const testGroqModelConnection = async (apiKey: string, model: string): Promise<string> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{
          role: 'user',
          content: 'Generate a short test response to verify the connection.'
        }],
        temperature: 0.2,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error testing Groq model connection:', error);
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

// Call Ollama API
const callOllamaAPI = async (messages: ApiMessage[]): Promise<string> => {
  const config = getApiProvider();
  const ollamaUrl = config.ollamaUrl;
  const ollamaModel = config.ollamaModel;
  
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

// Call Groq API
const callGroqAPI = async (messages: ApiMessage[]): Promise<string> => {
  const config = getApiProvider();
  const groqApiKey = config.groqApiKey;
  const groqModel = config.groqModel;
  
  if (!groqApiKey) {
    throw new Error('No Groq API key configured. Please enter your Groq API key in settings.');
  }

  if (!groqModel) {
    throw new Error('No Groq model selected. Please select a model in settings.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: groqModel,
        messages: messages,
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};
