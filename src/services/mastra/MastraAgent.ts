
import { Mastra } from "@mastra/core";
import { ChatGroq } from "@langchain/community/chat_models/groq";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { getApiProvider } from '../apiService';
import { AgentState } from '@/types/agent';

export class MastraAgent {
  protected mastra: Mastra;
  protected systemPrompt: string;
  protected agentType: string;
  protected chatModel: ChatGroq | ChatOllama;

  constructor(agentType: string, systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
    this.chatModel = this.getModel();
    this.mastra = new Mastra();
    this.initialize();
  }

  private getModel() {
    const { 
      apiProvider, 
      groqApiKey, 
      groqModel, 
      ollamaUrl, 
      ollamaModel 
    } = getApiProvider();

    if (apiProvider === 'groq') {
      return new ChatGroq({
        apiKey: groqApiKey as string,
        modelName: groqModel as string,
      });
    } else {
      return new ChatOllama({
        baseUrl: ollamaUrl as string,
        model: ollamaModel as string,
        temperature: 0.1,
      });
    }
  }

  protected initialize(): void {
    const promptTemplate = this.createPromptTemplate();
    
    // Add the main task node to the Mastra graph
    this.mastra.addTask("process_input", async (input: string) => {
      const promptValue = await promptTemplate.invoke({
        input,
        history: [],
      });
      
      const result = await this.chatModel.invoke(promptValue);
      return result.content.toString();
    });
  }

  protected createPromptTemplate() {
    return ChatPromptTemplate.fromMessages([
      ["system", this.systemPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"]
    ]);
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    try {
      // Execute the Mastra task with the input
      const output = await this.mastra.run("process_input", input);
      
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
