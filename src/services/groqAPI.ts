
const API_KEY_LOCAL_STORAGE = 'GROQ_API_KEY';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  usage: {
    total_tokens: number;
  };
}

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_LOCAL_STORAGE);
};

export const setApiKey = (apiKey: string): void => {
  localStorage.setItem(API_KEY_LOCAL_STORAGE, apiKey);
};

export const callGroqAPI = async (
  messages: GroqMessage[],
  model: string = 'llama3-70b-8192'
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

    const data: GroqResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};
