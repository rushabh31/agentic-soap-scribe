
import { v4 as uuidv4 } from 'uuid';
import { AgentState } from '@/types/agent';
import { toast } from 'sonner';
import { RoutingAgent } from './langgraph/RoutingAgent';
import { SentimentAnalysisEngine } from './langgraph/SentimentAnalysisEngine';
import { UrgencyAnalysisEngine } from './langgraph/UrgencyAnalysisEngine';
import { MedicalInformationExtractor } from './langgraph/MedicalInformationExtractor';
import { SOAPGenerator } from './langgraph/SOAPGenerator';
import { EvaluationEngine } from './langgraph/EvaluationEngine';
import { AuthorizationAgent } from './agents/AuthorizationAgent';
import { ClaimsAgent } from './agents/ClaimsAgent';
import { GeneralAgent } from './agents/GeneralAgent';
import { StateGraph } from '@langchain/langgraph';
import { RunnableSequence } from '@langchain/core/runnables';

export class MultiAgentSystem {
  private routingAgent: RoutingAgent;
  private authAgent: AuthorizationAgent;
  private claimsAgent: ClaimsAgent;
  private generalAgent: GeneralAgent;
  private urgencyEngine: UrgencyAnalysisEngine;
  private sentimentEngine: SentimentAnalysisEngine;
  private medicalExtractor: MedicalInformationExtractor;
  private soapGenerator: SOAPGenerator;
  private evaluationEngine: EvaluationEngine;
  
  constructor() {
    // Initialize all agents
    this.routingAgent = new RoutingAgent();
    this.authAgent = new AuthorizationAgent();
    this.claimsAgent = new ClaimsAgent();
    this.generalAgent = new GeneralAgent();
    this.urgencyEngine = new UrgencyAnalysisEngine();
    this.sentimentEngine = new SentimentAnalysisEngine();
    this.medicalExtractor = new MedicalInformationExtractor();
    this.soapGenerator = new SOAPGenerator();
    this.evaluationEngine = new EvaluationEngine();
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
      // Create a StateGraph for the multi-agent system
      const builder = new StateGraph({
        channels: {
          agentState: { value: state },
          transcript: { value: "" }
        }
      });

      // Step 1: Route the call
      builder.addNode("routing", async (inputs) => {
        toast.info("Routing call...");
        const currentState = inputs.agentState;
        if (progressCallback) progressCallback(currentState, 1, 7, "routing", transcript, "Processing transcript for routing...");
        
        const updatedState = await this.routingAgent.processState(currentState);
        
        if (progressCallback) progressCallback(updatedState, 1, 7, "routing", transcript, 
          `Disposition determined: ${updatedState.disposition || 'general inquiry'}`);
        
        return { agentState: updatedState };
      });

      // Step 2: Process with the appropriate specialist agent based on disposition
      builder.addNode("specialist", async (inputs) => {
        const currentState = inputs.agentState;
        toast.info(`Processing with ${currentState.disposition || 'specialist'} agent...`);
        if (progressCallback) progressCallback(currentState, 2, 7);
        
        let specialistInput = `Processing transcript with disposition: ${currentState.disposition || 'general inquiry'}`;
        let specialistOutput = '';
        let agentType = '';
        let updatedState = currentState;
        
        if (currentState.disposition === 'authorization') {
          agentType = 'authorization';
          updatedState = await this.authAgent.process(currentState);
          specialistOutput = `Authorization details extracted: Reference #${
            (currentState.extractedInfo.authorization?.reference || 'not found')}`;
        } else if (currentState.disposition === 'claims_inquiry') {
          agentType = 'claims';
          updatedState = await this.claimsAgent.process(currentState);
          specialistOutput = `Claims details extracted: Claim #${
            (currentState.extractedInfo.claims?.claimNumber || 'not found')}`;
        } else {
          agentType = 'general';
          updatedState = await this.generalAgent.process(currentState);
          specialistOutput = 'General inquiry processed';
        }
        
        if (progressCallback) progressCallback(updatedState, 2, 7, agentType, specialistInput, specialistOutput);
        
        return { agentState: updatedState };
      });

      // Step 3: Process urgency analysis
      builder.addNode("urgency", async (inputs) => {
        const currentState = inputs.agentState;
        if (progressCallback) progressCallback(currentState, 3, 7, "urgency", "Analyzing transcript urgency...", "Processing...");
        const updatedState = await this.urgencyEngine.processState(currentState);
        if (progressCallback) progressCallback(
          updatedState, 3, 7, 
          "urgency", 
          "Analyzing transcript urgency...", 
          `Urgency level determined: ${updatedState.urgency?.level || 'unknown'}`
        );
        return { agentState: updatedState };
      });

      // Step 4: Process sentiment analysis
      builder.addNode("sentiment", async (inputs) => {
        const currentState = inputs.agentState;
        if (progressCallback) progressCallback(currentState, 3, 7, "sentiment", "Analyzing sentiment...", "Processing...");
        const updatedState = await this.sentimentEngine.processState(currentState);
        if (progressCallback) progressCallback(
          updatedState, 3, 7, 
          "sentiment", 
          "Analyzing sentiment...", 
          `Sentiment analysis: ${updatedState.sentiment?.overall || 'neutral'} (score: ${updatedState.sentiment?.score || 0})`
        );
        return { agentState: updatedState };
      });

      // Step 5: Process medical information extraction
      builder.addNode("medical", async (inputs) => {
        const currentState = inputs.agentState;
        if (progressCallback) progressCallback(currentState, 3, 7, "medical", "Extracting medical information...", "Processing...");
        const updatedState = await this.medicalExtractor.processState(currentState);
        if (progressCallback) progressCallback(
          updatedState, 3, 7, 
          "medical", 
          "Extracting medical information...",
          `Medical information extracted: ${updatedState.medicalInfo?.conditions?.length || 0} conditions found`
        );
        return { agentState: updatedState };
      });

      // Step 6: Generate SOAP note
      builder.addNode("soap", async (inputs) => {
        const currentState = inputs.agentState;
        toast.info('Generating SOAP note...');
        if (progressCallback) progressCallback(currentState, 4, 7, "soap_generator", "Generating SOAP note...", "Processing...");
        const updatedState = await this.soapGenerator.processState(currentState);
        if (progressCallback) progressCallback(
          updatedState, 4, 7, 
          "soap_generator", 
          "Generating SOAP note...",
          `SOAP note generated with ${updatedState.soapNote ? 
            `${updatedState.soapNote.subjective.length + updatedState.soapNote.objective.length + 
            updatedState.soapNote.assessment.length + updatedState.soapNote.plan.length} characters` : 'error'}`
        );
        return { agentState: updatedState };
      });

      // Step 7: Evaluate the results
      builder.addNode("evaluation", async (inputs) => {
        const currentState = inputs.agentState;
        toast.info('Evaluating results...');
        if (progressCallback) progressCallback(currentState, 5, 7, "evaluation", "Evaluating results...", "Processing...");
        const updatedState = await this.evaluationEngine.processState(currentState);
        if (progressCallback) {
          const score = updatedState.evaluationResults?.overallScore || 'N/A';
          progressCallback(
            updatedState, 5, 7, 
            "evaluation", 
            "Evaluating results...", 
            `Evaluation complete with score: ${score}/100`
          );
        }
        return { agentState: updatedState };
      });

      // Define the workflow - sequential for simplicity and to avoid errors
      builder.addEdge("routing", "specialist");
      builder.addEdge("specialist", "urgency");
      builder.addEdge("urgency", "sentiment");
      builder.addEdge("sentiment", "medical");
      builder.addEdge("medical", "soap");
      builder.addEdge("soap", "evaluation");
      
      // Setting entry and finish point
      builder.setEntryPoint("routing");
      builder.setFinishPoint("evaluation");
      
      // Compile and run the graph
      const graph = builder.compile();
      toast.info('Starting multi-agent processing...');
      
      const result = await graph.invoke({ 
        agentState: state, 
        transcript 
      });
      
      toast.success('Processing complete!');
      return result.agentState;
      
    } catch (error) {
      console.error('Error in multi-agent system:', error);
      toast.error(`Processing error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
