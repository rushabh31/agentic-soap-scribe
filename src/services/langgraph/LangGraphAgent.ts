
import { AgentState } from '@/types/agent';
import { callApi, ApiMessage } from '../apiService';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from '@langchain/core/tools';

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
    
    // Create the ReAct agent
    const agent = createReactAgent({
      llm: {
        invoke: async (input) => {
          try {
            const messages: ApiMessage[] = [
              { role: 'system', content: this.systemPrompt },
              { role: 'user', content: input.content }
            ];
            
            const response = await callApi(messages);
            return { content: response };
          } catch (error) {
            console.error(`Error in ${this.agentType} agent:`, error);
            throw error;
          }
        }
      },
      tools
    });
    
    return agent;
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    try {
      // Create the ReAct agent
      const agent = this.createReactAgent(state.transcript || "");
      
      // Invoke the agent
      const result = await agent.invoke({ content: input });
      
      // Return the result
      return {
        output: result.content,
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
