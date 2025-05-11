
import { AgentState, SOAPNote, DocumentationResult, MedicalInfo, TopicResult, CallDisposition, SentimentType, EvaluationResults } from '@/types/agent';
import { callApi, ApiMessage } from './apiService';
import { MultiAgentSystem } from './MultiAgentSystem';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export class HealthcareContactCenterSystem {
  private multiAgentSystem: MultiAgentSystem;
  
  constructor() {
    this.multiAgentSystem = new MultiAgentSystem();
  }
  
  /**
   * Sequential Pipeline Implementation
   */
  public async runSequentialPipeline(transcript: string): Promise<DocumentationResult> {
    toast.info('Starting sequential pipeline processing...');
    
    try {
      // Step 1: Call Disposition Identification
      const disposition = await this.identifyDisposition(transcript);
      toast.info(`Identified disposition: ${disposition.disposition}`);
      
      // Step 2: SOAP Note Generation
      const soapNote = await this.generateSOAPSummary(transcript, disposition.disposition);
      toast.info('Generated SOAP note');
      
      // Step 3: Sentiment Analysis
      const sentimentResult = await this.analyzeSentiment(transcript);
      toast.info(`Analyzed sentiment: ${sentimentResult.sentiment}`);
      
      // Step 4: Topic Labeling
      const topics = await this.assignTopicLabels(transcript, disposition.disposition);
      toast.info('Assigned topic labels');
      
      // Return the combined results
      return {
        transcript,
        disposition: disposition.disposition,
        summary: soapNote,
        sentiment: {
          sentiment: sentimentResult.sentiment as SentimentType,
          score: sentimentResult.score
        },
        topics
      };
    } catch (error) {
      toast.error(`Sequential pipeline error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Multi-Agent System Implementation (using existing MultiAgentSystem)
   */
  public async runMultiAgentSystem(
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
    return await this.multiAgentSystem.processTranscript(transcript, progressCallback);
  }
  
  /**
   * Process and evaluate healthcare call with both pipelines
   */
  public async processAndEvaluateCall(
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
    toast.info('Processing call with both pipelines...');
    
    try {
      // Run both pipelines
      const multiAgentState = await this.runMultiAgentSystem(transcript, progressCallback);
      const sequentialResult = await this.runSequentialPipeline(transcript);
      
      // If multi-agent state doesn't have evaluation results yet, create them
      if (!multiAgentState.evaluationResults) {
        multiAgentState.evaluationResults = {
          overallScore: 0,
          multiAgent: {
            soapNote: multiAgentState.soapNote,
            overallQuality: 0
          },
          sequential: {
            soapNote: sequentialResult.summary,
            overallQuality: 0
          }
        };
      } else {
        // Otherwise update sequential state
        multiAgentState.evaluationResults.sequential.soapNote = sequentialResult.summary;
      }
      
      // Compare results
      const comparisonResult = await this.compareResults(
        transcript, 
        multiAgentState.soapNote || { subjective: '', objective: '', assessment: '', plan: '' }, 
        sequentialResult.summary
      );
      
      // Update evaluation results with comparison data
      const multiAgentFinalState = {
        ...multiAgentState,
        evaluationResults: {
          ...multiAgentState.evaluationResults,
          ...comparisonResult
        }
      };
      
      // Send a final message
      const message = {
        id: uuidv4(),
        from: 'evaluation' as any,
        to: 'all' as any,
        content: `Evaluation complete. Multi-agent score: ${comparisonResult.multiAgent.overallQuality?.toFixed(1)}/10, Sequential score: ${comparisonResult.sequential.overallQuality?.toFixed(1)}/10. Winner: ${comparisonResult.winner}`,
        timestamp: Date.now()
      };
      
      return {
        ...multiAgentFinalState,
        messages: [...multiAgentFinalState.messages, message]
      };
    } catch (error) {
      toast.error(`Evaluation error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Helper Methods for Sequential Pipeline
   */
  
  private async identifyDisposition(transcript: string): Promise<{ disposition: CallDisposition; confidence: number }> {
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a healthcare contact center expert. Your task is to identify the disposition (type) of this call. 
        The possible dispositions are: authorization, claims_inquiry, benefits_explanation, grievance, enrollment, 
        provider_issue, pharmacy, referral, eligibility, appeals, wellness_program, care_management, 
        coverage_verification, billing, member_services, technical_support, appointment_scheduling, other. 
        Return only the disposition category name without any additional explanation.`
      },
      { role: 'user', content: `Transcript: ${transcript}\n\nWhat is the disposition of this call?` }
    ];
    
    const result = await callApi(messages);
    
    // Normalize the result to match our disposition categories
    const normalizedResult = result.toLowerCase().trim();
    let disposition = "other" as CallDisposition;
    
    // Check for each possible disposition
    const dispositions: CallDisposition[] = [
      "authorization", "claims_inquiry", "benefits_explanation", "grievance", 
      "enrollment", "provider_issue", "pharmacy", "referral", "eligibility", 
      "appeals", "wellness_program", "care_management", "coverage_verification", 
      "billing", "member_services", "technical_support", "appointment_scheduling", "other"
    ];
    
    for (const disp of dispositions) {
      if (normalizedResult.includes(disp)) {
        disposition = disp;
        break;
      }
    }
    
    return {
      disposition,
      confidence: 0.9 // Simplified confidence score
    };
  }
  
  private async generateSOAPSummary(transcript: string, disposition: string): Promise<SOAPNote> {
    // Different prompt templates based on disposition type
    const dispositionPrompts: Record<string, string> = {
      "authorization": 
        "For this authorization call, extract: (1) The specific procedure requested, (2) Medical necessity details, " +
        "(3) Provider information, (4) Timeline and urgency factors, (5) Documentation status, and (6) Authorization status.",
      
      "claims_inquiry": 
        "For this claims inquiry call, extract: (1) Claim number(s) and status, (2) Service dates and providers, " +
        "(3) Denial reasons, (4) Billed and allowed amounts, (5) Member financial responsibility, and (6) Appeal opportunities.",
      
      "benefits_explanation": 
        "For this benefits explanation call, extract: (1) Specific benefit inquiries, (2) Coverage limitations, " +
        "(3) Cost-sharing details, (4) Network considerations, (5) Prior authorization requirements, and (6) Effective dates.",
      
      // Default prompt for other dispositions
      "default": 
        "Extract the key information from this healthcare call and organize it into a comprehensive SOAP note."
    };
    
    const promptTemplate = dispositionPrompts[disposition] || dispositionPrompts.default;
    
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a clinical documentation specialist in a healthcare contact center. 
        Create a comprehensive SOAP note (Subjective, Objective, Assessment, Plan) based on the call transcript. 
        ${promptTemplate} 
        Format your response with clear sections for Subjective, Objective, Assessment, and Plan.`
      },
      { role: 'user', content: `Transcript: ${transcript}\n\nGenerate a SOAP note:` }
    ];
    
    const result = await callApi(messages);
    
    // Parse the SOAP sections from the result
    return this.parseSOAPSections(result);
  }
  
  private async analyzeSentiment(transcript: string): Promise<{ sentiment: SentimentType; score: number }> {
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a sentiment analysis expert in healthcare communications. 
        Analyze the sentiment of this call transcript and classify it as 'satisfied', 'neutral', or 'dissatisfied'. 
        Also provide a sentiment score from 0 (extremely negative) to 10 (extremely positive).`
      },
      { role: 'user', content: `Transcript: ${transcript}\n\nSentiment analysis:` }
    ];
    
    const result = await callApi(messages);
    
    // Parse the sentiment result
    const sentiment = result.toLowerCase().includes("satisfied") && !result.toLowerCase().includes("dissatisfied") 
      ? "satisfied" as SentimentType
      : result.toLowerCase().includes("dissatisfied") 
        ? "dissatisfied" as SentimentType
        : "neutral" as SentimentType;
    
    // Extract score using regex pattern matching
    const scoreMatch = result.match(/\b([0-9]|10)\b/);
    const score = scoreMatch ? parseInt(scoreMatch[0]) : 5;
    
    return { sentiment, score };
  }
  
  private async assignTopicLabels(transcript: string, disposition: string): Promise<TopicResult> {
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a healthcare topic classification expert. 
        Identify the top 3 specific topics discussed in this call transcript. 
        The call has been classified as ${disposition}. 
        Assign confidence scores (0-1) to each topic.`
      },
      { role: 'user', content: `Transcript: ${transcript}\n\nIdentify topics:` }
    ];
    
    const result = await callApi(messages);
    
    // Parse topics and confidences
    const topics = result.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const match = line.match(/([^(]*)(?:\(([0-9.]+)\))?/);
        return match ? match[1].trim() : line.trim();
      })
      .slice(0, 3);
    
    const confidences = result.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const match = line.match(/\(([0-9.]+)\)/);
        return match ? parseFloat(match[1]) : 0.8;
      })
      .slice(0, 3);
    
    return { topics, confidences };
  }
  
  /**
   * Helper Method for Evaluation System
   */
  private async compareResults(
    transcript: string,
    multiAgentSOAP: SOAPNote,
    sequentialSOAP: SOAPNote
  ): Promise<{
    winner: 'multiagent' | 'legacy' | 'tie';
    reasoning: string;
    multiAgent: {
      completeness: { score: number, comments: string };
      accuracy: { score: number, comments: string };
      clinicalRelevance: { score: number, comments: string };
      actionability: { score: number, comments: string };
      overallQuality: number;
    };
    sequential: {
      completeness: { score: number, comments: string };
      accuracy: { score: number, comments: string };
      clinicalRelevance: { score: number, comments: string };
      actionability: { score: number, comments: string };
      overallQuality: number;
    };
  }> {
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a healthcare documentation evaluation expert. Compare these two SOAP notes generated from the same transcript - 
        one by a multi-agent system and one by a sequential pipeline. Evaluate them on:
        1. Completeness (0-10)
        2. Accuracy (0-10) 
        3. Clinical Relevance (0-10)
        4. Actionability (0-10)
        
        For each dimension, provide a score and brief comments. Calculate an overall quality score using this formula:
        Overall Quality = 0.3 * Completeness + 0.3 * Accuracy + 0.2 * Clinical Relevance + 0.2 * Actionability
        
        Finally, determine which system performed better, and provide reasoning for your conclusion.
        
        Return your evaluation as JSON in this exact format:
        {
          "winner": "multiagent" or "legacy" or "tie",
          "reasoning": "explanation for why one system is better",
          "multiAgent": {
            "completeness": { "score": 0-10, "comments": "brief comments" },
            "accuracy": { "score": 0-10, "comments": "brief comments" },
            "clinicalRelevance": { "score": 0-10, "comments": "brief comments" },
            "actionability": { "score": 0-10, "comments": "brief comments" },
            "overallQuality": 0-10
          },
          "sequential": {
            "completeness": { "score": 0-10, "comments": "brief comments" },
            "accuracy": { "score": 0-10, "comments": "brief comments" },
            "clinicalRelevance": { "score": 0-10, "comments": "brief comments" },
            "actionability": { "score": 0-10, "comments": "brief comments" },
            "overallQuality": 0-10
          }
        }`
      },
      { 
        role: 'user', 
        content: `Transcript: ${transcript}\n\n
        Multi-Agent System SOAP Note:
        Subjective: ${multiAgentSOAP.subjective}
        Objective: ${multiAgentSOAP.objective}
        Assessment: ${multiAgentSOAP.assessment}
        Plan: ${multiAgentSOAP.plan}
        
        Sequential Pipeline SOAP Note:
        Subjective: ${sequentialSOAP.subjective}
        Objective: ${sequentialSOAP.objective}
        Assessment: ${sequentialSOAP.assessment}
        Plan: ${sequentialSOAP.plan}
        
        Compare and evaluate these SOAP notes:` 
      }
    ];
    
    const result = await callApi(messages);
    
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('Error parsing comparison result:', error);
      
      // Return default structure if parsing fails
      return {
        winner: 'tie',
        reasoning: 'Unable to determine a clear winner due to parsing error.',
        multiAgent: {
          completeness: { score: 5, comments: 'Evaluation error' },
          accuracy: { score: 5, comments: 'Evaluation error' },
          clinicalRelevance: { score: 5, comments: 'Evaluation error' },
          actionability: { score: 5, comments: 'Evaluation error' },
          overallQuality: 5
        },
        sequential: {
          completeness: { score: 5, comments: 'Evaluation error' },
          accuracy: { score: 5, comments: 'Evaluation error' },
          clinicalRelevance: { score: 5, comments: 'Evaluation error' },
          actionability: { score: 5, comments: 'Evaluation error' },
          overallQuality: 5
        }
      };
    }
  }
  
  /**
   * Utility Method to Parse SOAP Sections
   */
  private parseSOAPSections(soapText: string): SOAPNote {
    // Initialize with empty sections
    const soapNote: SOAPNote = {
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

// Create a singleton instance
export const healthcareSystem = new HealthcareContactCenterSystem();
