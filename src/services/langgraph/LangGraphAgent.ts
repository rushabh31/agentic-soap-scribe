
import { AgentState } from '@/types/agent';
import { callApi, ApiMessage } from '../apiService';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from '@langchain/core/tools';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { RunnableConfig } from "@langchain/core/runnables";
import { Runnable } from "@langchain/core/runnables";
import { LanguageModelOutput } from "@langchain/core/language_models/base";

// Define an interface for IterableReadableStream
interface IterableReadableStream<T> {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}

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
    
    // Create a custom llm object that conforms to the expected interface
    const llm: Runnable<BaseLanguageModelInput, LanguageModelOutput, RunnableConfig> = {
      invoke: async (input: BaseLanguageModelInput): Promise<LanguageModelOutput> => {
        try {
          let inputContent: string;
          if (typeof input === 'string') {
            inputContent = input;
          } else if (input instanceof HumanMessage || input instanceof BaseMessage) {
            inputContent = typeof input.content === 'string' ? input.content : JSON.stringify(input.content);
          } else if (typeof input === 'object' && input !== null && 'content' in input) {
            inputContent = typeof input.content === 'string' ? input.content : JSON.stringify(input.content);
          } else {
            inputContent = JSON.stringify(input);
          }
          
          const messages: ApiMessage[] = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: inputContent }
          ];
          
          const response = await callApi(messages);
          return new HumanMessage(response);
        } catch (error) {
          console.error(`Error in ${this.agentType} agent:`, error);
          throw error;
        }
      },
      
      // Required interface methods with proper implementations
      lc_runnable: true,
      lc_namespace: ["langchain", "llms"],
      lc_serializable: true,
      
      batch: async function(inputs: BaseLanguageModelInput[], options?: RunnableConfig): Promise<LanguageModelOutput[]> {
        return Promise.all(inputs.map(input => this.invoke(input, options)));
      },
      
      stream: async function(input: BaseLanguageModelInput, options?: RunnableConfig): Promise<IterableReadableStream<LanguageModelOutput>> {
        const result = await this.invoke(input, options);
        // Create and return an IterableReadableStream
        return {
          [Symbol.asyncIterator]: async function* () {
            yield result;
          }
        };
      },
      
      // Implement the required methods
      bind: function(args: Record<string, unknown>): Runnable {
        return this;
      },
      
      getName: function(): string {
        return "CustomLLM";
      },
      
      map: function(): Runnable {
        return this;
      },
      
      pipe: function(): Runnable {
        return this;
      },
      
      withConfig: function(): Runnable {
        return this;
      },
      
      withListeners: function(): Runnable {
        return this;
      },
      
      withRetry: function(): Runnable {
        return this;
      },
      
      withMaxRetries: function(): Runnable {
        return this;
      },
      
      streamFromIterable: function(iterable: AsyncIterable<LanguageModelOutput>): Promise<IterableReadableStream<LanguageModelOutput>> {
        return Promise.resolve({
          [Symbol.asyncIterator]: async function* () {
            for await (const item of iterable) {
              yield item;
            }
          }
        });
      },
      
      // Additional required methods
      withBind: function(): Runnable {
        return this;
      },
      
      withMaxConcurrency: function(): Runnable {
        return this;
      },
      
      withOptions: function(): Runnable {
        return this;
      }
    };
    
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
