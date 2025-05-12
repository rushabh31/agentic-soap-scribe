
import { Agent } from '../Agent';
import { AgentState, EvaluationDimension } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Completeness Evaluator Agent in a healthcare multi-agent system.
Your specialized role is to assess how complete and comprehensive healthcare documentation is.
You focus specifically on:
1. Whether all relevant information from the transcript is captured
2. Whether all required sections of the SOAP note are properly filled
3. If there are any missing critical pieces of information
4. The overall comprehensiveness of the documentation

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
    
    // Evaluate completeness for multi-agent SOAP note
    const multiAgentCompleteness = await this.evaluateCompleteness(
      state.soapNote,
      state.transcript
    );
    
    // Evaluate completeness for sequential SOAP note
    const sequentialCompleteness = await this.evaluateCompleteness(
      state.evaluationResults.sequential.soapNote || state.soapNote,
      state.transcript
    );
    
    // Update the evaluation results
    const updatedEvaluationResults = {
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
    
    // Send a message about the completeness evaluation
    const message = `Completeness evaluation complete. Multi-agent score: ${multiAgentCompleteness.score.toFixed(1)}/10, Sequential score: ${sequentialCompleteness.score.toFixed(1)}/10`;
    
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
Please evaluate the following SOAP note for completeness:

SOAP NOTE:
Subjective: ${soapNote.subjective}
Objective: ${soapNote.objective}
Assessment: ${soapNote.assessment}
Plan: ${soapNote.plan}

Original Transcript:
${transcript}

Evaluate the SOAP note on the following dimensions of completeness:
1. Information Capture Rate (0-10): What percentage of important information from the transcript is captured?
2. Section Completeness (0-10): How completely are all SOAP sections filled out?
3. Critical Information Inclusion (0-10): Are all critical pieces of information included?
4. Detail Level (0-10): Is the level of detail appropriate and sufficient?

Provide your evaluation as JSON with the following structure:
{
  "score": 0-10,
  "metrics": {
    "informationCaptureRate": { "score": 0-10, "details": "explanation" },
    "sectionCompleteness": { "score": 0-10, "details": "explanation" },
    "criticalInformationInclusion": { "score": 0-10, "details": "explanation" },
    "detailLevel": { "score": 0-10, "details": "explanation" }
  }
}
`;

    const evaluationResponse = await this.callLLM(prompt);
    
    try {
      const evaluation = JSON.parse(evaluationResponse);
      return evaluation;
    } catch (error) {
      console.error("Failed to parse completeness evaluation response:", error);
      return {
        score: 5,
        metrics: {
          informationCaptureRate: { score: 5, details: "Error evaluating information capture rate" },
          sectionCompleteness: { score: 5, details: "Error evaluating section completeness" },
          criticalInformationInclusion: { score: 5, details: "Error evaluating critical information inclusion" },
          detailLevel: { score: 5, details: "Error evaluating detail level" }
        }
      };
    }
  }
}
