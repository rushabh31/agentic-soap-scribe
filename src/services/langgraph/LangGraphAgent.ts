
import { AgentState } from '@/types/agent';
import { callApi, ApiMessage } from '../apiService';
import { StateGraph } from '@langchain/langgraph';
import { END, RunnableSequence } from '@langchain/core/runnables';

export class LangGraphAgent {
  protected systemPrompt: string;
  protected agentType: string;

  constructor(agentType: string, systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
  }

  protected createGraph() {
    const processNode = async (state: AgentState, input: string) => {
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
    };

    // Create a simple graph with one node
    const builder = new StateGraph({
      channels: {
        output: { value: "" },
        state: { value: {} as AgentState }
      }
    });

    // Add the process node
    builder.addNode("process", RunnableSequence.from([
      processNode
    ]));

    // Set the entry point
    builder.setEntryPoint("process");

    // Set the exit point
    builder.addEdge("process", END);

    return builder.compile();
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    const graph = this.createGraph();
    const result = await graph.invoke({
      output: "",
      state
    }, { input });
    
    return {
      output: result.output,
      state: result.state
    };
  }
}
