
import { AgentState } from '@/types/agent';
import { callApi, ApiMessage } from '../apiService';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from '@langchain/core/tools';
import { HumanMessage, BaseMessage, AIMessage } from '@langchain/core/messages';
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { RunnableConfig } from "@langchain/core/runnables";
import { Runnable } from "@langchain/core/runnables";
import { LanguageModelOutput } from "@langchain/core/language_models/base";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

// Custom tool for transcript analysis
class TranscriptAnalysisTool extends Tool {
  name = "transcript_analysis";
  description = "Analyze the call transcript to extract specific information based on the given query.";
  
  constructor(private transcript: string) {
    super();
  }
  
  async _call(query: string): Promise<string> {
    try {
      // Create a prompt that combines the query with the transcript
      const messages: ApiMessage[] = [
        { 
          role: 'system', 
          content: `You are an expert healthcare data extraction assistant. Analyze the transcript to answer the specific query.` 
        },
        { 
          role: 'user', 
          content: `Query: ${query}\n\nTranscript: ${this.transcript}`
        }
      ];
      
      // Call the API service to generate a response
      return await callApi(messages);
    } catch (error) {
      console.error(`Error in transcript analysis tool:`, error);
      return `Error analyzing transcript: ${error}`;
    }
  }
}

// Create a custom LLM class that extends BaseChatModel
class CustomChatModel extends BaseChatModel {
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

export class LangGraphAgent {
  protected systemPrompt: string;
  protected agentType: string;

  constructor(agentType: string, systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
  }

  protected createReactAgent(transcript: string) {
    // Create the tools for this agent
    const tools = [
      new TranscriptAnalysisTool(transcript)
    ];
    
    // Create a proper chat model instance
    const llm = new CustomChatModel(this.systemPrompt, this.agentType);
    
    // Create the ReAct agent
    return createReactAgent({
      llm,
      tools
    });
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    try {
      // Create the ReAct agent
      const agent = this.createReactAgent(state.transcript || "");
      
      // Invoke the agent
      const result = await agent.invoke({ 
        messages: [new HumanMessage(input)]
      });
      
      let output = "";
      
      // Extract the content from the result
      if (typeof result === 'string') {
        output = result;
      } else if ('messages' in result && Array.isArray(result.messages) && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];
        if (typeof lastMessage === 'string') {
          output = lastMessage;
        } else if (typeof lastMessage === 'object' && lastMessage !== null && 'content' in lastMessage) {
          output = String(lastMessage.content);
        }
      } else if ('response' in result && typeof result.response === 'string') {
        output = result.response;
      } else if (typeof result === 'object' && result !== null) {
        output = JSON.stringify(result);
      }
      
      // Return the result
      return {
        output,
        state
      };
    } catch (error) {
      console.error(`Error in ${this.agentType} agent:`, error);
      return {
        output: `Error: ${error}`,
        state
      };
    }
  }
}
