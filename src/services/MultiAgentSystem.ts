
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
import { END } from '@langchain/core/runnables';

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
          state: { value: state }
        }
      });

      // Step 1: Route the call
      builder.addNode("routing", async (input) => {
        toast.info("Routing call...");
        if (progressCallback) progressCallback(input.state, 1, 7, "routing", transcript, "Processing transcript for routing...");
        
        const updatedState = await this.routingAgent.processState(input.state);
        
        if (progressCallback) progressCallback(updatedState, 1, 7, "routing", transcript, 
          `Disposition determined: ${updatedState.disposition || 'general inquiry'}`);
        
        return { state: updatedState };
      });

      // Step 2: Process with the appropriate specialist agent based on disposition
      builder.addNode("specialist", async (input) => {
        const currentState = input.state;
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
        
        return { state: updatedState };
      });

      // Step 3: Process urgency analysis
      builder.addNode("urgency", async (input) => {
        if (progressCallback) progressCallback(input.state, 3, 7, "urgency", "Analyzing transcript urgency...", "Processing...");
        const updatedState = await this.urgencyEngine.processState(input.state);
        if (progressCallback) progressCallback(
          updatedState, 3, 7, 
          "urgency", 
          "Analyzing transcript urgency...", 
          `Urgency level determined: ${updatedState.urgency?.level || 'unknown'}`
        );
        return { state: updatedState };
      });

      // Step 4: Process sentiment analysis
      builder.addNode("sentiment", async (input) => {
        if (progressCallback) progressCallback(input.state, 3, 7, "sentiment", "Analyzing sentiment...", "Processing...");
        const updatedState = await this.sentimentEngine.processState(input.state);
        if (progressCallback) progressCallback(
          updatedState, 3, 7, 
          "sentiment", 
          "Analyzing sentiment...", 
          `Sentiment analysis: ${updatedState.sentiment?.overall || 'neutral'} (score: ${updatedState.sentiment?.score || 0})`
        );
        return { state: updatedState };
      });

      // Step 5: Process medical information extraction
      builder.addNode("medical", async (input) => {
        if (progressCallback) progressCallback(input.state, 3, 7, "medical", "Extracting medical information...", "Processing...");
        const updatedState = await this.medicalExtractor.processState(input.state);
        if (progressCallback) progressCallback(
          updatedState, 3, 7, 
          "medical", 
          "Extracting medical information...",
          `Medical information extracted: ${updatedState.medicalInfo?.conditions?.length || 0} conditions found`
        );
        return { state: updatedState };
      });

      // Step 6: Generate SOAP note
      builder.addNode("soap", async (input) => {
        toast.info('Generating SOAP note...');
        if (progressCallback) progressCallback(input.state, 4, 7, "soap_generator", "Generating SOAP note...", "Processing...");
        const updatedState = await this.soapGenerator.processState(input.state);
        if (progressCallback) progressCallback(
          updatedState, 4, 7, 
          "soap_generator", 
          "Generating SOAP note...",
          `SOAP note generated with ${updatedState.soapNote ? 
            `${updatedState.soapNote.subjective.length + updatedState.soapNote.objective.length + 
            updatedState.soapNote.assessment.length + updatedState.soapNote.plan.length} characters` : 'error'}`
        );
        return { state: updatedState };
      });

      // Step 7: Evaluate the results
      builder.addNode("evaluation", async (input) => {
        toast.info('Evaluating results...');
        if (progressCallback) progressCallback(input.state, 5, 7, "evaluation", "Evaluating results...", "Processing...");
        const updatedState = await this.evaluationEngine.processState(input.state);
        if (progressCallback) {
          const score = updatedState.evaluationResults?.overallScore || 'N/A';
          progressCallback(
            updatedState, 5, 7, 
            "evaluation", 
            "Evaluating results...", 
            `Evaluation complete with score: ${score}/100`
          );
        }
        return { state: updatedState };
      });

      // Define the workflow
      builder.addEdge("routing", "specialist");
      
      // These three can run in parallel after specialist
      builder.addEdge("specialist", "urgency");
      builder.addEdge("specialist", "sentiment");
      builder.addEdge("specialist", "medical");
      
      // After all analysis is done, generate SOAP note
      builder.addEdge("urgency", "soap");
      builder.addEdge("sentiment", "soap");
      builder.addEdge("medical", "soap");
      
      // Finally evaluate
      builder.addEdge("soap", "evaluation");
      builder.addEdge("evaluation", END);
      
      // Set the entry point
      builder.setEntryPoint("routing");
      
      // Compile and run the graph
      const graph = builder.compile();
      toast.info('Starting multi-agent processing...');
      
      const result = await graph.invoke({ state });
      
      toast.success('Processing complete!');
      return result.state;
      
    } catch (error) {
      console.error('Error in multi-agent system:', error);
      toast.error(`Processing error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
