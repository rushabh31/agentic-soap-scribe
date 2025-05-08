
import { v4 as uuidv4 } from 'uuid';
import { AgentState } from '@/types/agent';
import { RoutingAgent } from './agents/RoutingAgent';
import { AuthorizationAgent } from './agents/AuthorizationAgent';
import { ClaimsAgent } from './agents/ClaimsAgent';
import { GeneralAgent } from './agents/GeneralAgent';
import { UrgencyAnalysisEngine } from './agents/UrgencyAnalysisEngine';
import { SentimentAnalysisEngine } from './agents/SentimentAnalysisEngine';
import { MedicalInformationExtractor } from './agents/MedicalInformationExtractor';
import { SOAPGenerator } from './agents/SOAPGenerator';
import { ClinicalAccuracyAgent } from './agents/evaluators/ClinicalAccuracyAgent';
import { CompletenessAgent } from './agents/evaluators/CompletenessAgent';
import { ActionabilityAgent } from './agents/evaluators/ActionabilityAgent';
import { toast } from 'sonner';

export class MultiAgentSystem {
  private routingAgent: RoutingAgent;
  private authAgent: AuthorizationAgent;
  private claimsAgent: ClaimsAgent;
  private generalAgent: GeneralAgent;
  private urgencyEngine: UrgencyAnalysisEngine;
  private sentimentEngine: SentimentAnalysisEngine;
  private medicalExtractor: MedicalInformationExtractor;
  private soapGenerator: SOAPGenerator;
  private clinicalEvaluator: ClinicalAccuracyAgent;
  private completenessEvaluator: CompletenessAgent;
  private actionabilityEvaluator: ActionabilityAgent;
  
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
    this.clinicalEvaluator = new ClinicalAccuracyAgent();
    this.completenessEvaluator = new CompletenessAgent();
    this.actionabilityEvaluator = new ActionabilityAgent();
  }
  
  public async processTranscript(
    transcript: string,
    progressCallback?: (state: AgentState, step: number, totalSteps: number) => void
  ): Promise<AgentState> {
    // Initialize the state
    let state: AgentState = {
      transcript,
      extractedInfo: {},
      messages: []
    };
    
    try {
      // Step 1: Route the call
      toast.info("Routing call using Ollama...");
      if (progressCallback) progressCallback(state, 1, 7);
      state = await this.routingAgent.process(state);
      
      // Step 2: Process with the appropriate specialist agent based on disposition
      toast.info(`Processing with ${state.disposition || 'specialist'} agent...`);
      if (progressCallback) progressCallback(state, 2, 7);
      
      if (state.disposition === 'authorization') {
        state = await this.authAgent.process(state);
      } else if (state.disposition === 'claims_inquiry') {
        state = await this.claimsAgent.process(state);
      } else {
        state = await this.generalAgent.process(state);
      }
      
      // Step 3: Process with analysis engines in parallel
      toast.info('Running analysis engines...');
      if (progressCallback) progressCallback(state, 3, 7);
      
      // We'll run these in parallel for efficiency
      const [urgencyState, sentimentState, medicalState] = await Promise.all([
        this.urgencyEngine.process(state),
        this.sentimentEngine.process(state),
        this.medicalExtractor.process(state)
      ]);
      
      // Merge the analysis results into the state
      state = {
        ...state,
        urgency: urgencyState.urgency,
        sentiment: sentimentState.sentiment,
        medicalInfo: medicalState.medicalInfo,
        messages: [...state.messages, ...urgencyState.messages.filter(m => !state.messages.find(existing => existing.id === m.id)),
                   ...sentimentState.messages.filter(m => !state.messages.find(existing => existing.id === m.id)),
                   ...medicalState.messages.filter(m => !state.messages.find(existing => existing.id === m.id))]
      };
      
      // Step 4: Generate SOAP note
      toast.info('Generating SOAP note...');
      if (progressCallback) progressCallback(state, 4, 7);
      state = await this.soapGenerator.process(state);
      
      // Step 5-7: Evaluate the SOAP note
      toast.info('Evaluating clinical accuracy...');
      if (progressCallback) progressCallback(state, 5, 7);
      state = await this.clinicalEvaluator.process(state);
      
      toast.info('Evaluating documentation completeness...');
      if (progressCallback) progressCallback(state, 6, 7);
      state = await this.completenessEvaluator.process(state);
      
      toast.info('Evaluating actionability...');
      if (progressCallback) progressCallback(state, 7, 7);
      state = await this.actionabilityEvaluator.process(state);
      
      toast.success('Processing complete!');
      return state;
      
    } catch (error) {
      console.error('Error in multi-agent system:', error);
      toast.error(`Processing error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
