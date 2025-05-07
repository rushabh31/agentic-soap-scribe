
import { Agent } from '../Agent';
import { AgentState, EvaluationDimension, SOAPNote } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Clinical Accuracy Evaluator Agent in a healthcare multi-agent system.
You specialize in evaluating the clinical accuracy and relevance of healthcare documentation.
Your task is to assess SOAP notes for:
1. Factual correctness of medical information
2. Adherence to clinical best practices
3. Appropriate medical terminology usage
4. Identification of clinically significant findings
5. Alignment between assessment and plan sections

You will score documentation on a scale of 0-10 and provide detailed feedback on strengths and weaknesses.
Respond with structured evaluation metrics in JSON format.
`;

export class ClinicalAccuracyAgent extends Agent {
  constructor() {
    super('clinical_evaluator', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    if (!state.soapNote) {
      // Return early if there's no SOAP note to evaluate
      return this.sendMessage(state, 'all', "No SOAP note available for clinical accuracy evaluation");
    }
    
    // Create a sequential SOAP note for comparison (simplified version)
    const sequentialSoapNote = await this.generateSequentialSOAP(state.transcript);
    
    // Evaluate both SOAP notes
    const multiAgentEvaluation = await this.evaluateSoapNote(state.soapNote, state.transcript);
    const sequentialEvaluation = await this.evaluateSoapNote(sequentialSoapNote, state.transcript);
    
    // Update the state with evaluation results
    const updatedState = {
      ...state,
      evaluationResults: {
        multiAgent: {
          ...multiAgentEvaluation,
          soapNote: state.soapNote
        },
        sequential: {
          ...sequentialEvaluation,
          soapNote: sequentialSoapNote
        }
      }
    };
    
    // Send a message about the evaluation
    const message = `Clinical accuracy evaluation complete. Multi-agent score: ${multiAgentEvaluation.accuracy.score.toFixed(1)}/10, Sequential score: ${sequentialEvaluation.accuracy.score.toFixed(1)}/10`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private async evaluateSoapNote(soapNote: SOAPNote, transcript: string): Promise<{
    completeness: EvaluationDimension;
    accuracy: EvaluationDimension;
    clinicalRelevance: EvaluationDimension;
    actionability: EvaluationDimension;
    overallQuality: number;
  }> {
    const prompt = `
Please evaluate the following SOAP note for clinical accuracy and relevance:

SOAP NOTE:
Subjective: ${soapNote.subjective}
Objective: ${soapNote.objective}
Assessment: ${soapNote.assessment}
Plan: ${soapNote.plan}

Original Transcript:
${transcript}

Evaluate the SOAP note on the following dimensions:
1. Factual Accuracy Score (0-10): Are all statements factually correct?
2. Terminology Appropriateness (0-10): Is medical terminology used correctly?
3. Clinical Significance Score (0-10): Are clinically significant findings highlighted?
4. Assessment-Plan Alignment (0-10): Does the plan address issues identified in the assessment?

Provide your evaluation as JSON with the following structure:
{
  "accuracy": {
    "score": 0-10,
    "metrics": {
      "factualAccuracy": { "score": 0-10, "details": "explanation" },
      "terminologyAppropriateness": { "score": 0-10, "details": "explanation" }
    }
  },
  "clinicalRelevance": {
    "score": 0-10,
    "metrics": {
      "clinicalSignificance": { "score": 0-10, "details": "explanation" },
      "assessmentPlanAlignment": { "score": 0-10, "details": "explanation" }
    }
  },
  "overallClinicalQuality": 0-10
}
`;

    const evaluationResponse = await this.callLLM(prompt);
    let evaluation;
    
    try {
      evaluation = JSON.parse(evaluationResponse);
    } catch (error) {
      console.error("Failed to parse clinical evaluation response:", error);
      evaluation = {
        accuracy: { score: 5, metrics: {} },
        clinicalRelevance: { score: 5, metrics: {} },
        overallClinicalQuality: 5
      };
    }
    
    // Return a combined evaluation structure
    return {
      completeness: { score: 0, metrics: {} }, // Will be filled by CompletenessAgent
      accuracy: evaluation.accuracy,
      clinicalRelevance: evaluation.clinicalRelevance,
      actionability: { score: 0, metrics: {} }, // Will be filled by ActionabilityAgent
      overallQuality: evaluation.overallClinicalQuality
    };
  }
  
  private async generateSequentialSOAP(transcript: string): Promise<SOAPNote> {
    // Generate a simplified SOAP note representing a sequential approach
    const prompt = `
You are simulating a sequential pipeline that generates a SOAP note from a healthcare call transcript.
Unlike a multi-agent system, you do not have specialized agents focusing on different aspects of the call.
Generate a basic SOAP note that represents what a simple sequential process might produce.

Transcript:
${transcript}

Create a SOAP note with the following sections:
- Subjective: Information reported by the member
- Objective: Factual information from the transcript
- Assessment: Basic analysis of the situation
- Plan: Simple next steps

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
