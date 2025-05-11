
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { Tool } from '@langchain/core/tools';
import { BaseMessage, AIMessage } from '@langchain/core/messages';
import { callApi, ApiMessage } from '../apiService';

// Custom LLM class that extends BaseChatModel
export class CustomChatModel extends BaseChatModel {
  private systemPrompt: string;
  private agentType: string;

  constructor(systemPrompt: string, agentType: string) {
    super({});
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
  }

  async _generate(messages: BaseMessage[]): Promise<any> {
    try {
      // Get the last message content
      const lastMessage = messages[messages.length - 1];
      const inputContent = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : JSON.stringify(lastMessage.content);
      
      const apiMessages: ApiMessage[] = [
        { role: 'system', content: this.systemPrompt },
        { role: 'user', content: inputContent }
      ];
      
      const response = await callApi(apiMessages);
      
      return {
        generations: [
          {
            text: response,
            message: new AIMessage(response)
          }
        ]
      };
    } catch (error) {
      console.error(`Error in ${this.agentType} model:`, error);
      throw error;
    }
  }

  _llmType(): string {
    return "custom_chat_model";
  }

  // Required abstract method implementation
  async _combineLLMOutput() {
    return [];
  }

  // Add bindTools method required by the ReAct agent
  bindTools(tools: Tool[]): BaseChatModel {
    return this;
  }
}
