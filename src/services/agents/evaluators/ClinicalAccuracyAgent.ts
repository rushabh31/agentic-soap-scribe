
import { Agent } from '../Agent';
import { AgentState, EvaluationMetric, EvaluationDimension } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Clinical Accuracy Evaluator Agent in a healthcare contact center multi-agent system.
Your specialized role is to assess the factual correctness of medical information and alignment with clinical best practices in SOAP notes.

You should evaluate:
1. Factual Accuracy Score (FAS): Percentage of statements that accurately reflect the transcript
2. Contradiction Score (CS): Penalty for contradictions between the SOAP note and transcript

Provide numerical scores (0-10) and detailed explanations for your evaluations.
`;

export class ClinicalAccuracyAgent extends Agent {
  constructor() {
    super('clinical_evaluator', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    if (!state.soapNote) {
      return this.sendMessage(state, 'all', 'Cannot evaluate - no SOAP note available');
    }
    
    // First evaluate the multi-agent SOAP note
    const multiAgentEvaluation = await this.evaluateSOAP(state, state.soapNote, 'multi-agent');
    
    // Generate a sequential approach SOAP note for comparison
    const sequentialSOAP = await this.generateSequentialSOAP(state);
    
    // Evaluate the sequential SOAP note
    const sequentialEvaluation = await this.evaluateSOAP(state, sequentialSOAP, 'sequential');
    
    // Update the state with the evaluations
    const updatedState = {
      ...state,
      evaluationResults: {
        ...state.evaluationResults,
        multiAgent: {
          ...state.evaluationResults?.multiAgent,
          accuracy: multiAgentEvaluation
        },
        sequential: {
          ...state.evaluationResults?.sequential,
          accuracy: sequentialEvaluation
        }
      }
    };
    
    // Send a message with the comparison
    const message = `Clinical accuracy evaluation complete. Multi-agent score: ${multiAgentEvaluation.score}/10. Sequential score: ${sequentialEvaluation.score}/10.`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private async evaluateSOAP(state: AgentState, soapNote: any, approach: string): Promise<EvaluationDimension> {
    // Combine SOAP sections for evaluation
    const soapContent = Object.values(soapNote).join('\n\n');
    
    // Generate prompt for evaluation
    const prompt = `
Please evaluate the clinical accuracy of the following ${approach} SOAP note based on the original transcript.
Assess the Factual Accuracy Score (0-10) and the Contradiction Score (0-10, where 0 means many contradictions).

Original transcript:
${state.transcript}

SOAP note to evaluate:
${soapContent}

Format your evaluation as valid JSON with the following structure:
{
  "factualAccuracyScore": 0-10,
  "factualAccuracyDetails": "",
  "contradictionScore": 0-10,
  "contradictionDetails": "",
  "examples": [],
  "overallAccuracyScore": 0-10,
  "summary": ""
}
`;

    const evaluationResponse = await this.callLLM(prompt);
    
    // Parse the evaluation response
    let evaluation;
    try {
      evaluation = JSON.parse(evaluationResponse);
    } catch (error) {
      console.error(`Failed to parse ${approach} Clinical Accuracy evaluation:`, error);
      return {
        score: 0,
        metrics: {
          factualAccuracy: { score: 0, details: 'Evaluation failed' },
          contradiction: { score: 0, details: 'Evaluation failed' }
        }
      };
    }
    
    // Create the evaluation dimension
    const dimension: EvaluationDimension = {
      score: evaluation.overallAccuracyScore || 0,
      metrics: {
        factualAccuracy: { 
          score: evaluation.factualAccuracyScore || 0, 
          details: evaluation.factualAccuracyDetails || '' 
        },
        contradiction: { 
          score: evaluation.contradictionScore || 0, 
          details: evaluation.contradictionDetails || '' 
        }
      }
    };
    
    return dimension;
  }
  
  private async generateSequentialSOAP(state: AgentState): Promise<SOAPNote> {
    // Simulate the sequential approach by generating a SOAP note directly from the transcript
    const prompt = `
You are simulating a sequential pipeline approach to generating a SOAP note directly from a transcript.
Please create a SOAP note based only on the following healthcare call transcript.
Include Subjective, Objective, Assessment, and Plan sections.

Transcript:
${state.transcript}

Format your response with clear section headings: SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN.
`;

    const soapResponse = await this.callLLM(prompt);
    
    // Parse the SOAP sections
    const sections = this.parseSOAPSections(soapResponse);
    
    return sections;
  }
  
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
