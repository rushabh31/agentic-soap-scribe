
import { v4 as uuidv4 } from 'uuid';
import { AgentState, AgentType, AgentMessage } from '@/types/agent';
import { callApi, ApiMessage } from '../apiService';
import { toast } from 'sonner';

export abstract class Agent {
  protected type: AgentType;
  protected systemPrompt: string;
  
  constructor(type: AgentType, systemPrompt: string) {
    this.type = type;
    this.systemPrompt = systemPrompt;
  }

  public getType(): AgentType {
    return this.type;
  }

  protected async sendMessage(
    state: AgentState,
    to: AgentType | 'all',
    content: string
  ): Promise<AgentState> {
    const message: AgentMessage = {
      id: uuidv4(),
      from: this.type,
      to,
      content,
      timestamp: Date.now()
    };

    return {
      ...state,
      messages: [...state.messages, message]
    };
  }

  protected async callLLM(
    prompt: string,
    context: string = ''
  ): Promise<string> {
    try {
      const messages: ApiMessage[] = [
        { role: 'system', content: this.systemPrompt + (context ? `\n\nAdditional context:\n${context}` : '') },
        { role: 'user', content: prompt }
      ];

      return await callApi(messages);
    } catch (error) {
      toast.error(`Agent ${this.type} encountered an error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  public abstract process(state: AgentState): Promise<AgentState>;
}
