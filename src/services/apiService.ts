
const API_KEY_LOCAL_STORAGE = 'GROQ_API_KEY';
const API_PROVIDER_LOCAL_STORAGE = 'API_PROVIDER';
const OLLAMA_URL_LOCAL_STORAGE = 'OLLAMA_URL';
const OLLAMA_MODEL_LOCAL_STORAGE = 'OLLAMA_MODEL';

export type ApiProvider = 'groq' | 'ollama';

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

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_LOCAL_STORAGE);
};

export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_LOCAL_STORAGE, apiKey);
};

export const getApiProvider = (): ApiProvider => {
  return (localStorage.getItem(API_PROVIDER_LOCAL_STORAGE) as ApiProvider) || 'groq';
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
  const provider = getApiProvider();
  
  if (provider === 'groq') {
    return callGroqAPI(messages);
  } else if (provider === 'ollama') {
    return callOllamaAPI(messages);
  }
  
  throw new Error('Invalid API provider');
};

const callGroqAPI = async (
  messages: ApiMessage[],
  model: string = 'llama-3.1-8b-instant'
): Promise<string> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('No Groq API key found. Please enter your API key in settings.');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.2,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
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
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
};
