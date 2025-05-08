
import { Mastra } from "@mastra/core";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { getApiProvider } from '../apiService';
import { AgentState } from '@/types/agent';

export class MastraAgent {
  protected mastra: Mastra;
  protected systemPrompt: string;
  protected agentType: string;
  protected chatModel: any; // Using any to avoid type issues with different model types

  constructor(agentType: string, systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
    this.mastra = new Mastra();
    this.initialize();
  }

  private getApiConfig() {
    return getApiProvider();
  }

  protected initialize(): void {
    // Register a task with the agent name
    this.mastra.registerTask(this.agentType, async (input: string) => {
      // Create a simple prompt with system prompt and user input
      const prompt = `${this.systemPrompt}\n\n${input}`;
      
      // Get API provider configuration
      const apiConfig = this.getApiConfig();
      let result = "";
      
      try {
        if (apiConfig.apiProvider === 'groq') {
          result = await this.mastra.generateText({
            model: apiConfig.groqModel as string,
            prompt: prompt,
            apiKey: apiConfig.groqApiKey as string,
            provider: "groq"
          });
        } else {
          result = await this.mastra.generateText({
            model: apiConfig.ollamaModel as string,
            prompt: prompt,
            baseUrl: apiConfig.ollamaUrl as string,
            provider: "ollama" 
          });
        }
        return result.trim();
      } catch (error) {
        console.error(`Error in ${this.agentType} agent:`, error);
        throw error;
      }
    });
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    try {
      // Execute the Mastra task with the input
      const output = await this.mastra.executeTask(this.agentType, input);
      
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
