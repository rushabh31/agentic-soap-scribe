import { v4 as uuidv4 } from 'uuid';
import { AgentState } from '@/types/agent';
import { toast } from 'sonner';
import { RoutingAgent } from './mastra/RoutingAgent';
import { SentimentAnalysisEngine } from './mastra/SentimentAnalysisEngine';
import { UrgencyAnalysisEngine } from './mastra/UrgencyAnalysisEngine';
import { MedicalInformationExtractor } from './mastra/MedicalInformationExtractor';
import { SOAPGenerator } from './mastra/SOAPGenerator';
import { EvaluationEngine } from './mastra/EvaluationEngine';
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
      // Step 1: Route the call
      toast.info("Routing call...");
      if (progressCallback) progressCallback(state, 1, 7, "routing", transcript, "Processing transcript for routing...");
      state = await this.routingAgent.process(state);
      if (progressCallback) progressCallback(state, 1, 7, "routing", transcript, `Disposition determined: ${state.disposition || 'general inquiry'}`);
      
      // Step 2: Process with the appropriate specialist agent based on disposition
      toast.info(`Processing with ${state.disposition || 'specialist'} agent...`);
      if (progressCallback) progressCallback(state, 2, 7);
      
      let specialistInput = `Processing transcript with disposition: ${state.disposition || 'general inquiry'}`;
      let specialistOutput = '';
      let agentType = '';
      
      if (state.disposition === 'authorization') {
        agentType = 'authorization';
        state = await this.authAgent.process(state);
        specialistOutput = `Authorization details extracted: Reference #${state.extractedInfo.authorizationNumber || 'not found'}`;
      } else if (state.disposition === 'claims_inquiry') {
        agentType = 'claims';
        state = await this.claimsAgent.process(state);
        specialistOutput = `Claims details extracted: Claim #${state.extractedInfo.claimNumber || 'not found'}`;
      } else {
        agentType = 'general';
        state = await this.generalAgent.process(state);
        specialistOutput = 'General inquiry processed';
      }
      
      if (progressCallback) progressCallback(state, 2, 7, agentType, specialistInput, specialistOutput);
      
      // Step 3: Process with analysis engines in parallel using Mastra agents
      toast.info('Running analysis engines...');
      if (progressCallback) progressCallback(state, 3, 7);
      
      // We'll run these in parallel for efficiency but track each one separately
      const [urgencyState, sentimentState, medicalState] = await Promise.all([
        this.processUrgency(state, progressCallback),
        this.processSentiment(state, progressCallback),
        this.processMedical(state, progressCallback)
      ]);
      
      // Merge the analysis results into the state
      state = {
        ...state,
        urgency: urgencyState.urgency,
        sentiment: sentimentState.sentiment,
        medicalInfo: medicalState.medicalInfo,
        messages: [
          ...state.messages, 
          ...urgencyState.messages.filter(m => !state.messages.find(existing => existing.id === m.id)),
          ...sentimentState.messages.filter(m => !state.messages.find(existing => existing.id === m.id)),
          ...medicalState.messages.filter(m => !state.messages.find(existing => existing.id === m.id))
        ]
      };
      
      // Step 4: Generate SOAP note
      toast.info('Generating SOAP note...');
      if (progressCallback) progressCallback(state, 4, 7, "soap_generator", "Generating SOAP note...", "Processing...");
      state = await this.soapGenerator.process(state);
      if (progressCallback) progressCallback(
        state, 4, 7, 
        "soap_generator", 
        "Generating SOAP note...",
        `SOAP note generated with ${state.soapNote ? 
          `${state.soapNote.subjective.length + state.soapNote.objective.length + 
          state.soapNote.assessment.length + state.soapNote.plan.length} characters` : 'error'}`
      );
      
      // Step 5: Evaluate the results with our comprehensive evaluation engine
      toast.info('Evaluating results...');
      if (progressCallback) progressCallback(state, 5, 7, "evaluation", "Evaluating results...", "Processing...");
      state = await this.evaluationEngine.process(state);
      if (progressCallback) {
        const score = state.evaluationResults?.overallScore || 
                     (state.evaluationResults as any)?.overallScore || 'N/A';
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

  private async processUrgency(state: AgentState, progressCallback?: Function): Promise<AgentState> {
    if (progressCallback) progressCallback(state, 3, 7, "urgency", "Analyzing transcript urgency...", "Processing...");
    const updatedState = await this.urgencyEngine.process(state);
    if (progressCallback) progressCallback(
      state, 3, 7, 
      "urgency", 
      "Analyzing transcript urgency...", 
      `Urgency level determined: ${updatedState.urgency?.level || 'unknown'}`
    );
    return updatedState;
  }

  private async processSentiment(state: AgentState, progressCallback?: Function): Promise<AgentState> {
    if (progressCallback) progressCallback(state, 3, 7, "sentiment", "Analyzing sentiment...", "Processing...");
    const updatedState = await this.sentimentEngine.process(state);
    if (progressCallback) progressCallback(
      state, 3, 7, 
      "sentiment", 
      "Analyzing sentiment...", 
      `Sentiment analysis: ${updatedState.sentiment?.overall || 'neutral'} (score: ${updatedState.sentiment?.score || 0})`
    );
    return updatedState;
  }

  private async processMedical(state: AgentState, progressCallback?: Function): Promise<AgentState> {
    if (progressCallback) progressCallback(state, 3, 7, "medical", "Extracting medical information...", "Processing...");
    const updatedState = await this.medicalExtractor.process(state);
    if (progressCallback) progressCallback(
      state, 3, 7, 
      "medical", 
      "Extracting medical information...",
      `Medical information extracted: ${updatedState.medicalInfo?.conditions.length || 0} conditions found`
    );
    return updatedState;
  }
}
