
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
      toast.info('Starting multi-agent processing...');
      
      // Step 1: Route the call
      toast.info("Routing call...");
      if (progressCallback) progressCallback(state, 1, 7, "routing", transcript, "Processing transcript for routing...");
      state = await this.routingAgent.processState(state);
      if (progressCallback) progressCallback(state, 1, 7, "routing", transcript, 
        `Disposition determined: ${state.disposition || 'general inquiry'}`);
      
      // Step 2: Process with the appropriate specialist agent based on disposition
      toast.info(`Processing with ${state.disposition || 'specialist'} agent...`);
      if (progressCallback) progressCallback(state, 2, 7);
      
      let specialistInput = `Processing transcript with disposition: ${state.disposition || 'general inquiry'}`;
      let specialistOutput = '';
      let agentType = '';
      
      if (state.disposition === 'authorization') {
        agentType = 'authorization';
        state = await this.authAgent.process(state);
        specialistOutput = `Authorization details extracted: Reference #${
          (state.extractedInfo.authorization?.reference || 'not found')}`;
      } else if (state.disposition === 'claims_inquiry') {
        agentType = 'claims';
        state = await this.claimsAgent.process(state);
        specialistOutput = `Claims details extracted: Claim #${
          (state.extractedInfo.claims?.claimNumber || 'not found')}`;
      } else {
        agentType = 'general';
        state = await this.generalAgent.process(state);
        specialistOutput = 'General inquiry processed';
      }
      
      if (progressCallback) progressCallback(state, 2, 7, agentType, specialistInput, specialistOutput);
      
      // Step 3: Process urgency analysis
      if (progressCallback) progressCallback(state, 3, 7, "urgency", "Analyzing transcript urgency...", "Processing...");
      state = await this.urgencyEngine.processState(state);
      if (progressCallback) progressCallback(
        state, 3, 7, 
        "urgency", 
        "Analyzing transcript urgency...", 
        `Urgency level determined: ${state.urgency?.level || 'unknown'}`
      );
      
      // Step 4: Process sentiment analysis
      if (progressCallback) progressCallback(state, 3, 7, "sentiment", "Analyzing sentiment...", "Processing...");
      state = await this.sentimentEngine.processState(state);
      if (progressCallback) progressCallback(
        state, 3, 7, 
        "sentiment", 
        "Analyzing sentiment...", 
        `Sentiment analysis: ${state.sentiment?.overall || 'neutral'} (score: ${state.sentiment?.score || 0})`
      );
      
      // Step 5: Process medical information extraction
      if (progressCallback) progressCallback(state, 3, 7, "medical", "Extracting medical information...", "Processing...");
      state = await this.medicalExtractor.processState(state);
      if (progressCallback) progressCallback(
        state, 3, 7, 
        "medical", 
        "Extracting medical information...",
        `Medical information extracted: ${state.medicalInfo?.conditions?.length || 0} conditions found`
      );
      
      // Step 6: Generate SOAP note
      toast.info('Generating SOAP note...');
      if (progressCallback) progressCallback(state, 4, 7, "soap_generator", "Generating SOAP note...", "Processing...");
      state = await this.soapGenerator.processState(state);
      if (progressCallback) progressCallback(
        state, 4, 7, 
        "soap_generator", 
        "Generating SOAP note...",
        `SOAP note generated with ${state.soapNote ? 
          `${state.soapNote.subjective.length + state.soapNote.objective.length + 
          state.soapNote.assessment.length + state.soapNote.plan.length} characters` : 'error'}`
      );
      
      // Step 7: Evaluate the results
      toast.info('Evaluating results...');
      if (progressCallback) progressCallback(state, 5, 7, "evaluation", "Evaluating results...", "Processing...");
      state = await this.evaluationEngine.processState(state);
      if (progressCallback) {
        const score = state.evaluationResults?.overallScore || 'N/A';
        progressCallback(
          state, 5, 7, 
          "evaluation", 
          "Evaluating results...", 
          `Evaluation complete with score: ${score}/100`
        );
      }
      
      toast.success('Processing complete!');
      return state;
      
    } catch (error) {
      console.error('Error in multi-agent system:', error);
      toast.error(`Processing error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
