
import { 
  ChatPromptTemplate, 
  MessagesPlaceholder, 
  PromptTemplate 
} from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { getApiProvider } from '../apiService';
import { AgentState } from '@/types/agent';
import { 
  GroqModelName, 
  OllamaModelName, 
  GroqApiKey, 
  OllamaUrl 
} from "@/contexts/SettingsContext";
import { formatDocumentsAsString } from "langchain/util/document";
import { StructuredTool, Tool } from "@langchain/core/tools";
import { MessagesState, RunnableLambda } from "@langchain/langgraph/prebuilt";
import { ChatMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

export class LangGraphAgent {
  protected model: ChatGroq | ChatOllama;
  protected systemPrompt: string;
  protected graph: StateGraph<any>;
  protected agentType: string;

  constructor(agentType: string, systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.agentType = agentType;
    this.model = this.getModel();
    this.graph = this.createGraph();
  }

  private getModel(): ChatGroq | ChatOllama {
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
        modelName: groqModel as GroqModelName,
      });
    } else {
      return new ChatOllama({
        baseUrl: ollamaUrl as string,
        model: ollamaModel as OllamaModelName,
        temperature: 0.1,
      });
    }
  }

  protected createPromptTemplate(): ChatPromptTemplate {
    return ChatPromptTemplate.fromMessages([
      ["system", this.systemPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"]
    ]);
  }
  
  protected createGraph(): StateGraph<any> {
    // Define the basic state structure
    type State = {
      messages: ChatMessage[];
      input?: string;
      output?: string;
    };

    // Define the runnable for the model's execution
    const runnable = RunnableSequence.from([
      this.createPromptTemplate(),
      this.model
    ]);

    // Create the graph
    const builder: StateGraphArgs<State> = {
      channels: {
        messages: {
          value: (x: State) => x.messages,
          update: (x: State, y: ChatMessage[]) => ({ ...x, messages: y })
        },
        input: {
          value: (x: State) => x.input || "",
          update: (x: State, y: string) => ({ ...x, input: y })
        },
        output: {
          value: (x: State) => x.output || "",
          update: (x: State, y: string) => ({ ...x, output: y })
        }
      }
    };

    const workflow = new StateGraph(builder)
      .addNode("agent", RunnableSequence.from([
        (state) => {
          const history = state.messages || [];
          const input = state.input || "";
          return { history, input };
        },
        runnable
      ]));

    // Define the edges
    workflow.addEdge("start", "agent");
    workflow.addEdge("agent", "end");

    // Compile the graph
    return workflow.compile();
  }

  public async process(state: AgentState, input: string): Promise<{ output: string; state: AgentState }> {
    try {
      // Create the initial state for the graph
      const graphState = {
        messages: [new SystemMessage(this.systemPrompt)],
        input: input
      };

      // Execute the graph
      const result = await this.graph.invoke(graphState);
      
      // Extract the output from the result
      const output = result.output || result.messages[result.messages.length - 1]?.content || "";

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
