
import { Agent } from '../Agent';
import { AgentState, EvaluationDimension } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Documentation Completeness Evaluator Agent in a healthcare multi-agent system.
Your specialized role is to evaluate healthcare documentation for completeness and thoroughness.
You focus specifically on:
1. Ensuring all relevant information from the transcript is captured
2. Checking for omission of critical details
3. Evaluating information coverage across all SOAP sections
4. Identifying missing elements that would improve documentation quality

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
    
    // Update the state with the completeness evaluation
    const updatedState = {
      ...state,
      evaluationResults: updatedEvaluationResults
    };
    
    // Send a message about the evaluation completion
    const message = `Completeness evaluation complete. Multi-agent system completeness: ${multiAgentCompleteness.score.toFixed(1)}/10, Sequential pipeline completeness: ${sequentialCompleteness.score.toFixed(1)}/10`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private async evaluateCompleteness(soapNote: any, transcript: string): Promise<EvaluationDimension> {
    if (!soapNote) {
      return {
        score: 0,
        metrics: {},
        comments: "No SOAP note available for evaluation"
      };
    }
    
    const prompt = `
Please evaluate the following SOAP note for completeness against the original transcript:

SOAP NOTE:
Subjective: ${soapNote.subjective}
Objective: ${soapNote.objective}
Assessment: ${soapNote.assessment}
Plan: ${soapNote.plan}

Original Transcript:
${transcript}

Evaluate the SOAP note on the following dimensions of completeness:
1. Information Coverage (0-10): How much relevant information from the transcript is captured in the note?
2. Detail Inclusion (0-10): How thorough is the note in including specific details?
3. Medical Thoroughness (0-10): Are all medical aspects adequately covered?
4. Critical Element Inclusion (0-10): Are all critical elements from the transcript included?

Identify any significant omissions or missing information from the transcript.

Provide your evaluation as valid JSON with the following structure:
{
  "score": 0-10,
  "metrics": {
    "informationCoverage": { "score": 0-10, "details": "explanation" },
    "detailInclusion": { "score": 0-10, "details": "explanation" },
    "medicalThoroughness": { "score": 0-10, "details": "explanation" },
    "criticalElementInclusion": { "score": 0-10, "details": "explanation" }
  },
  "omissions": ["specific omission 1", "specific omission 2"]
}
`;

    const evaluationResponse = await this.callLLM(prompt);
    
    try {
      const evaluation = JSON.parse(evaluationResponse);
      
      // Add comments if missing
      if (!evaluation.comments) {
        evaluation.comments = evaluation.omissions && evaluation.omissions.length > 0 
          ? `Omissions identified: ${evaluation.omissions.join(", ")}` 
          : "Completeness evaluation completed.";
      }
      
      return evaluation;
    } catch (error) {
      console.error("Failed to parse completeness evaluation response:", error);
      return {
        score: 5,
        metrics: {
          informationCoverage: { score: 5, details: "Error evaluating information coverage" },
          detailInclusion: { score: 5, details: "Error evaluating detail inclusion" },
          medicalThoroughness: { score: 5, details: "Error evaluating medical thoroughness" },
          criticalElementInclusion: { score: 5, details: "Error evaluating critical element inclusion" }
        },
        omissions: ["Unable to identify specific omissions due to evaluation error"],
        comments: "Error occurred during evaluation"
      };
    }
  }
}
