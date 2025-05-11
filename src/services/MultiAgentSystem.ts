
import { v4 as uuidv4 } from 'uuid';
import { AgentState } from '@/types/agent';
import { toast } from 'sonner';
import { MultiAgentGraph } from './langgraph/MultiAgentGraph';

export class MultiAgentSystem {
  private multiAgentGraph: MultiAgentGraph;
  
  constructor() {
    // Initialize the LangGraph-based multi-agent system
    this.multiAgentGraph = new MultiAgentGraph();
  }
  
  public async processTranscript(
    transcript: string,
    progressCallback?: (
      state: AgentState, 
      step: number, 
      totalSteps: number, 
      agentType?: string,
      input?: string,
      output?: string
    ) => void
  ): Promise<AgentState> {
    // Initialize the state
    let state: AgentState = {
      transcript,
      extractedInfo: {},
      messages: []
    };
    
    try {
      toast.info('Starting LangGraph multi-agent processing...');
      
      // Process the transcript using the LangGraph multi-agent system
      if (progressCallback) progressCallback(state, 1, 5, "system", transcript, "Initializing LangGraph workflow...");
      
      // Run the multi-agent graph
      state = await this.multiAgentGraph.processTranscript(transcript);
      
      // Notify about completion
      toast.success('LangGraph processing complete!');
      return state;
      
    } catch (error) {
      console.error('Error in LangGraph multi-agent system:', error);
      toast.error(`Processing error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
