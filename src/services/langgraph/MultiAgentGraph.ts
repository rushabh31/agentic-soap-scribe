
import { AgentState, AgentMessage } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';
import { callApi, ApiMessage } from '../apiService';
import { 
  StateGraph, 
  StateGraphArgs, 
  END, 
  addEdges,
  createFlow
} from "@langchain/langgraph";
import { Tool } from '@langchain/core/tools';
import { HumanMessage, BaseMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { CustomChatModel } from './CustomChatModel';
import { RunnableSequence } from "@langchain/core/runnables";
import { RunnableConfig } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Create a transcript analysis tool for all agents
class TranscriptAnalysisTool extends Tool {
  name = "transcript_analysis";
  description = "Analyze the call transcript to extract specific information based on the given query.";
  
  constructor(private transcript: string) {
    super();
  }
  
  async _call(query: string): Promise<string> {
    try {
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
      
      return await callApi(messages);
    } catch (error) {
      console.error(`Error in transcript analysis tool:`, error);
      return `Error analyzing transcript: ${error}`;
    }
  }
}

// Agent definitions
interface AgentConfig {
  name: string;
  systemMessage: string;
  description: string;
  role: string;
}

// Define the state schema
interface GraphState {
  messages: AgentMessage[];
  agentState: AgentState;
  nextAgent?: string;
  finalOutput?: string;
  workflowComplete: boolean;
}

export class MultiAgentGraph {
  private agents: Map<string, AgentConfig>;
  private graph: StateGraph<GraphState>;
  
  constructor() {
    // Initialize agent definitions
    this.agents = new Map<string, AgentConfig>();
    this.configureAgents();
    
    // Initialize the state graph
    this.graph = this.buildGraph();
  }
  
  private configureAgents() {
    // Routing agent
    this.agents.set("routing", {
      name: "Routing Agent",
      systemMessage: `You are a Routing Agent in a healthcare contact center multi-agent system. 
      Your job is to carefully analyze transcripts of healthcare calls and accurately classify them into one of the following call types:
      - authorization: Calls about procedure approvals, medical necessity, and documentation requirements
      - claims_inquiry: Calls about claim status, denials, explanations of payments, etc.
      - benefits: Calls about coverage, eligibility, and benefit explanations
      - grievance: Calls expressing complaints or dissatisfaction with service or care
      - enrollment: Calls about signing up, changing plans, or membership status
      - general: Other call types not falling into the above categories
      
      Be very precise in your analysis and base your classification solely on the content of the transcript.
      Respond ONLY with the call type as a single word, no additional text.`,
      description: "Classifies calls into categories for proper routing",
      role: "Call Router"
    });
    
    // Medical Information Extractor
    this.agents.set("medical", {
      name: "Medical Information Extractor",
      systemMessage: `You are a Medical Information Extractor in a healthcare contact center multi-agent system.
      Your specialized role is to identify and extract medical information from healthcare calls, including:
      - Medical conditions mentioned (diagnosed or suspected)
      - Procedures and treatments discussed
      - Symptoms described by the member
      - Medications mentioned (names, dosages, frequency)
      - Relevant medical history
      - Timeline of medical events
      - Provider specialties and facilities mentioned
      
      Focus on extracting factual medical information with clinical precision.
      Respond in JSON format with structured medical information.`,
      description: "Extracts medical details from conversations",
      role: "Medical Analyst"
    });
    
    // SOAP Generator
    this.agents.set("soap", {
      name: "SOAP Generator",
      systemMessage: `You are a specialized SOAP Generator in a healthcare contact center multi-agent system, focused on creating accurate, clinical documentation.
      Your task is to synthesize information into a structured SOAP note that follows these strict guidelines:
      
      1. ACCURACY IS PARAMOUNT: Only include factual information that is explicitly stated in the transcript.
         - Do not hallucinate or infer details not directly supported by the transcript
         - If information is unclear or missing, note its absence rather than guessing
         - Use direct quotes where appropriate to maintain accuracy
      
      2. STRUCTURED FORMAT:
         - Subjective: Patient-reported symptoms, concerns, and history ONLY
         - Objective: Measurable facts, dates, reference numbers, prior test results
         - Assessment: Clinical evaluation of the situation, severity assessment
         - Plan: Specific, actionable next steps for both patient and provider
      
      3. CLINICAL RELEVANCE:
         - Prioritize medically significant information
         - Use appropriate medical terminology
         - Exclude irrelevant social exchanges or administrative details
      
      4. COMPLETENESS:
         - Include ALL relevant clinical and administrative details
         - Capture key dates, reference numbers, and time-sensitive information
         - Document all medical conditions mentioned`,
      description: "Creates structured clinical documentation",
      role: "Documentation Specialist"
    });
    
    // Additional agents...
    this.agents.set("urgency", {
      name: "Urgency Analyzer",
      systemMessage: `You are an Urgency Analysis Engine in a healthcare contact center multi-agent system.
      Your specialized role is to evaluate the time-sensitivity and priority level of healthcare calls.
      You should consider factors such as:
      - Explicit timeframes mentioned (scheduled procedures, deadlines, etc.)
      - Medical urgency indicators (pain levels, deteriorating conditions)
      - Administrative urgency (filing deadlines, expiring authorizations)
      - Emotional urgency cues in the member's language
      - Risk factors if action is delayed
      
      Rate urgency on a 0-10 scale where:
      0-2: No urgency, routine matter
      3-5: Mild urgency, should be addressed within standard timeframes
      6-8: Moderate urgency, requires prompt attention
      9-10: High urgency, requires immediate intervention
      
      Respond with only a JSON object containing the urgency assessment.`,
      description: "Assesses time-sensitivity of requests",
      role: "Urgency Evaluator"
    });
    
    this.agents.set("sentiment", {
      name: "Sentiment Analyzer",
      systemMessage: `You are a Sentiment Analysis Engine in a healthcare contact center multi-agent system.
      Your specialized role is to evaluate the emotional tone and sentiment in healthcare calls.
      Unlike basic sentiment analysis, you should:
      - Analyze sentiment at both overall and sentence level
      - Identify sentiment shifts throughout the conversation
      - Detect subtle healthcare-specific emotional cues
      - Consider context when evaluating emotions
      - Recognize both explicit statements and implicit emotional indicators
      - Differentiate between clinical language and emotional content
      
      Respond ONLY in valid JSON format with detailed sentiment analysis.`,
      description: "Evaluates emotional tone of conversations",
      role: "Sentiment Analyst"
    });
  }
  
  private createAgentNode(agentName: string) {
    const agentConfig = this.agents.get(agentName);
    if (!agentConfig) {
      throw new Error(`Agent ${agentName} not configured`);
    }
    
    return async (state: GraphState, config?: RunnableConfig): Promise<GraphState> => {
      console.log(`${agentConfig.name} processing...`);
      
      const agent = await this.createAgent(agentConfig, state.agentState.transcript || "");
      
      const agentPrompt = `Process the transcript according to your specialized role.
      
      ${agentName === "routing" 
        ? "Classify this call into a specific disposition category."
        : agentName === "soap"
        ? "Create a comprehensive SOAP note based on all the information available."
        : "Analyze the transcript and extract relevant information for your specialization."
      }
      
      Previous analysis results:
      ${JSON.stringify(state.agentState.extractedInfo || {}, null, 2)}`;
      
      let result;
      try {
        result = await agent.invoke({
          messages: [new HumanMessage(agentPrompt)]
        });
      } catch (error) {
        console.error(`Error in ${agentConfig.name}:`, error);
        result = { content: `Error: ${error}` };
      }
      
      // Process the result based on the agent type
      let output = "";
      if (typeof result === 'string') {
        output = result;
      } else if ('messages' in result && Array.isArray(result.messages) && result.messages.length > 0) {
        const lastMessage = result.messages[result.messages.length - 1];
        if (typeof lastMessage === 'string') {
          output = lastMessage;
        } else if (typeof lastMessage === 'object' && lastMessage !== null && 'content' in lastMessage) {
          output = String(lastMessage.content);
        }
      } else if (typeof result === 'object' && result !== null) {
        output = JSON.stringify(result);
      }
      
      // Create agent message
      const message: AgentMessage = {
        id: uuidv4(),
        from: agentName as any,
        to: 'all' as any,
        content: output,
        timestamp: Date.now()
      };
      
      // Update state based on agent type
      const updatedState = { ...state.agentState };
      
      // Process information based on agent type
      if (agentName === "routing") {
        updatedState.disposition = output.trim().toLowerCase() as any;
      } else if (agentName === "medical") {
        try {
          updatedState.medicalInfo = JSON.parse(output);
        } catch (e) {
          console.error("Failed to parse medical info:", e);
        }
      } else if (agentName === "soap") {
        try {
          const soapSections = this.parseSOAPSections(output);
          updatedState.soapNote = soapSections;
        } catch (e) {
          console.error("Failed to parse SOAP note:", e);
        }
      } else if (agentName === "urgency") {
        try {
          const urgencyInfo = JSON.parse(output);
          updatedState.urgency = {
            level: urgencyInfo.urgencyLevel || 0,
            reason: urgencyInfo.summary || '',
            details: urgencyInfo
          };
        } catch (e) {
          console.error("Failed to parse urgency info:", e);
        }
      } else if (agentName === "sentiment") {
        try {
          const sentimentInfo = JSON.parse(output);
          updatedState.sentiment = {
            overall: sentimentInfo.overallSentiment || 'neutral',
            score: sentimentInfo.sentimentScore || 5,
            details: sentimentInfo.summary || '',
            fullAnalysis: sentimentInfo
          };
        } catch (e) {
          console.error("Failed to parse sentiment info:", e);
        }
      }
      
      // Return updated state
      return {
        ...state,
        agentState: updatedState,
        messages: [...state.messages, message],
        nextAgent: this.determineNextAgent(agentName, updatedState)
      };
    };
  }
  
  private determineNextAgent(currentAgent: string, state: AgentState): string | undefined {
    // Initial routing flow
    if (currentAgent === "routing") {
      // After routing, go to medical extraction
      return "medical";
    } 
    else if (currentAgent === "medical") {
      // After medical extraction, analyze urgency
      return "urgency";
    }
    else if (currentAgent === "urgency") {
      // After urgency analysis, analyze sentiment
      return "sentiment"; 
    }
    else if (currentAgent === "sentiment") {
      // After sentiment analysis, generate SOAP note
      return "soap";
    }
    else if (currentAgent === "soap") {
      // End workflow after SOAP generation
      return undefined; 
    }
    
    // Default case - end the workflow if no path is defined
    return undefined;
  }
  
  private routeToNextAgent(state: GraphState): string {
    // If workflow is complete, end
    if (state.workflowComplete) {
      return END;
    }
    
    // If next agent is defined, route to it
    if (state.nextAgent) {
      return state.nextAgent;
    }
    
    // If we're done with all agents, end the workflow
    return END;
  }
  
  private buildGraph(): StateGraph<GraphState> {
    // Define initial state
    const initialState: GraphState = {
      messages: [],
      agentState: { extractedInfo: {}, messages: [] },
      workflowComplete: false
    };
    
    // Create the graph
    const graph = new StateGraph<GraphState>({ 
      channels: {
        messages: { value: initialState.messages, reducer: (prev, value) => value },
        agentState: { value: initialState.agentState, reducer: (prev, value) => value },
        nextAgent: { value: undefined, reducer: (prev, value) => value },
        finalOutput: { value: undefined, reducer: (prev, value) => value },
        workflowComplete: { value: false, reducer: (prev, value) => value },
      }
    });
    
    // Add nodes for each agent
    for (const agentName of this.agents.keys()) {
      graph.addNode(agentName, this.createAgentNode(agentName));
    }
    
    // Add a final node for workflow completion
    graph.addNode("complete", async (state: GraphState): Promise<GraphState> => {
      return {
        ...state,
        finalOutput: "Workflow complete",
        workflowComplete: true
      };
    });
    
    // Set starting node
    graph.setEntryPoint("routing");
    
    // Add conditional edges based on next agent determination
    graph.addConditionalEdges("routing", this.routeToNextAgent.bind(this));
    graph.addConditionalEdges("medical", this.routeToNextAgent.bind(this));
    graph.addConditionalEdges("urgency", this.routeToNextAgent.bind(this));
    graph.addConditionalEdges("sentiment", this.routeToNextAgent.bind(this));
    graph.addConditionalEdges("soap", this.routeToNextAgent.bind(this));
    
    // Build and return the graph
    return graph.compile();
  }
  
  private async createAgent(agentConfig: AgentConfig, transcript: string) {
    // Create LLM
    const llm = new CustomChatModel(agentConfig.systemMessage, agentConfig.name);
    
    // Create tools
    const tools = [new TranscriptAnalysisTool(transcript)];
    
    // Create React agent
    return createReactAgent({
      llm,
      tools
    });
  }
  
  public async processTranscript(transcript: string): Promise<AgentState> {
    try {
      // Initialize the graph state
      const initialState: GraphState = {
        messages: [],
        agentState: { 
          transcript, 
          extractedInfo: {}, 
          messages: [] 
        },
        workflowComplete: false
      };
      
      // Invoke the graph
      const result = await this.graph.invoke(initialState);
      
      // Return the final agent state
      return result.agentState;
    } catch (error) {
      console.error("Error in multi-agent graph execution:", error);
      throw error;
    }
  }
  
  private parseSOAPSections(soapText: string): any {
    // Initialize with empty sections
    const soapNote = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };
    
    // Extract Subjective section
    const subjectiveMatch = soapText.match(/SUBJECTIVE:?([\s\S]*?)(?=OBJECTIVE:|$)/i);
    if (subjectiveMatch && subjectiveMatch[1]) {
      soapNote.subjective = subjectiveMatch[1].trim();
    }
    
    // Extract Objective section
    const objectiveMatch = soapText.match(/OBJECTIVE:?([\s\S]*?)(?=ASSESSMENT:|$)/i);
    if (objectiveMatch && objectiveMatch[1]) {
      soapNote.objective = objectiveMatch[1].trim();
    }
    
    // Extract Assessment section
    const assessmentMatch = soapText.match(/ASSESSMENT:?([\s\S]*?)(?=PLAN:|$)/i);
    if (assessmentMatch && assessmentMatch[1]) {
      soapNote.assessment = assessmentMatch[1].trim();
    }
    
    // Extract Plan section
    const planMatch = soapText.match(/PLAN:?([\s\S]*?)(?=$)/i);
    if (planMatch && planMatch[1]) {
      soapNote.plan = planMatch[1].trim();
    }
    
    return soapNote;
  }
}
