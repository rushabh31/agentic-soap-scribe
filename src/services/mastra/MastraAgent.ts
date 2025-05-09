
import { AgentState } from '@/types/agent';
import { getApiProvider } from '../apiService';
import { callApi, ApiMessage } from '../apiService';

export class MastraAgent {
  protected systemPrompt: string;
  protected agentType: string;

  constructor(agentType: string, systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
  }

  private getApiConfig() {
    return getApiProvider();
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    try {
      // Create a simple prompt with system prompt and user input
      const messages: ApiMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: input }
      ];
      
      // Call the API service to generate a response
      const output = await callApi(messages);
      
      return {
        output,
        state
      };
    } catch (error) {
      console.error(`Error in ${this.agentType} agent:`, error);
      throw error;
    }
  }
}
