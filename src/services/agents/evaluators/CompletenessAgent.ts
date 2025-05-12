
import { Agent } from '../Agent';
import { AgentState, EvaluationDimension } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Completeness Evaluator Agent in a healthcare multi-agent system.
Your specialized role is to evaluate the completeness of healthcare documentation.
You focus specifically on:
1. Coverage of all relevant information from the original conversation
2. Documentation of key details related to the patient, providers, and treatments
3. Thoroughness of medical history and findings documentation
4. Absence of critical omissions that would impact care

You will score documentation on a scale of 0-10 and provide detailed feedback on strengths and weaknesses.
Respond with structured evaluation metrics in JSON format.
`;

export class CompletenessAgent extends Agent {
  constructor() {
    super('completeness_evaluator', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    if (!state.soapNote || !state.evaluationResults) {
      return state;
    }
    
    // Evaluate the completeness of the multi-agent SOAP note
    const multiAgentCompleteness = await this.evaluateCompleteness(
      state.soapNote, 
      state.transcript || ""
    );
    
    // Evaluate the completeness of the sequential SOAP note
    const sequentialCompleteness = await this.evaluateCompleteness(
      state.evaluationResults.sequential.soapNote || state.soapNote,
      state.transcript || ""
    );
    
    // Update the evaluation results
    const updatedEvaluationResults = {
      ...state.evaluationResults,
      multiAgent: {
        ...state.evaluationResults.multiAgent,
        completeness: multiAgentCompleteness
      },
      sequential: {
        ...state.evaluationResults.sequential,
        completeness: sequentialCompleteness
      }
    };
    
    // Update the state with the evaluation results
    const updatedState = {
      ...state,
      evaluationResults: updatedEvaluationResults
    };
    
    // Send a message about the evaluation completion
    const message = `Completeness evaluation complete. 
Multi-agent score: ${multiAgentCompleteness.score.toFixed(1)}/10
Sequential score: ${sequentialCompleteness.score.toFixed(1)}/10`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private async evaluateCompleteness(soapNote: any, transcript: string): Promise<EvaluationDimension> {
    if (!soapNote) {
      return {
        score: 0,
        metrics: {}
      };
    }
    
    const prompt = `
Please evaluate the completeness of the following SOAP note against the original transcript:

SOAP NOTE:
Subjective: ${soapNote.subjective}
Objective: ${soapNote.objective}
Assessment: ${soapNote.assessment}
Plan: ${soapNote.plan}

Original Transcript:
${transcript}

Evaluate the SOAP note on the following dimensions of completeness:
1. Information Coverage (0-10): Does the note include all key information from the transcript?
2. Detail Inclusion (0-10): Are specific details (dates, numbers, names) accurately captured?
3. Medical Thoroughness (0-10): Are all medical details properly documented?
4. Critical Element Inclusion (0-10): Are there any critical omissions that would impact care?

Provide your evaluation as JSON with the following structure:
{
  "score": 0-10,
  "metrics": {
    "informationCoverage": { "score": 0-10, "details": "explanation" },
    "detailInclusion": { "score": 0-10, "details": "explanation" },
    "medicalThoroughness": { "score": 0-10, "details": "explanation" },
    "criticalElementInclusion": { "score": 0-10, "details": "explanation" }
  },
  "omissions": [
    "list any important items that were omitted"
  ]
}
`;

    const evaluationResponse = await this.callLLM(prompt);
    
    try {
      const evaluation = JSON.parse(evaluationResponse);
      return {
        score: evaluation.score,
        metrics: evaluation.metrics,
        omissions: evaluation.omissions
      };
    } catch (error) {
      console.error("Failed to parse completeness evaluation response:", error);
      return {
        score: 5,
        metrics: {
          informationCoverage: { score: 5, details: "Error evaluating information coverage" },
          detailInclusion: { score: 5, details: "Error evaluating detail inclusion" },
          medicalThoroughness: { score: 5, details: "Error evaluating medical thoroughness" },
          criticalElementInclusion: { score: 5, details: "Error evaluating critical element inclusion" }
        }
      };
    }
  }
}
