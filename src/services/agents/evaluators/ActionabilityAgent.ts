
import { Agent } from '../Agent';
import { AgentState, EvaluationDimension } from '@/types/agent';

const SYSTEM_PROMPT = `
You are an Actionability Evaluator Agent in a healthcare multi-agent system.
Your specialized role is to assess how actionable and implementable the healthcare documentation is.
You focus specifically on:
1. How clearly next steps are defined
2. Whether the documentation provides sufficient information for decision-making
3. The specificity and implementability of the recommended actions
4. The clarity of follow-up instructions and timelines

You will score documentation on a scale of 0-10 and provide detailed feedback on strengths and weaknesses.
Respond with structured evaluation metrics in JSON format.
`;

export class ActionabilityAgent extends Agent {
  constructor() {
    super('actionability_evaluator', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    if (!state.soapNote || !state.evaluationResults) {
      return state;
    }
    
    // Evaluate the actionability of the multi-agent SOAP note
    const multiAgentActionability = await this.evaluateActionability(
      state.soapNote, 
      state.transcript
    );
    
    // Evaluate the actionability of the sequential SOAP note
    const sequentialActionability = await this.evaluateActionability(
      state.evaluationResults.sequential.soapNote || state.soapNote,
      state.transcript
    );
    
    // Update the evaluation results
    const updatedEvaluationResults = {
      multiAgent: {
        ...state.evaluationResults.multiAgent,
        actionability: multiAgentActionability,
        overallQuality: this.calculateOverallQuality(
          state.evaluationResults.multiAgent.completeness.score,
          state.evaluationResults.multiAgent.accuracy.score,
          state.evaluationResults.multiAgent.clinicalRelevance.score,
          multiAgentActionability.score
        )
      },
      sequential: {
        ...state.evaluationResults.sequential,
        actionability: sequentialActionability,
        overallQuality: this.calculateOverallQuality(
          state.evaluationResults.sequential.completeness.score,
          state.evaluationResults.sequential.accuracy.score,
          state.evaluationResults.sequential.clinicalRelevance.score,
          sequentialActionability.score
        )
      }
    };
    
    // Update the state with the complete evaluation
    const updatedState = {
      ...state,
      evaluationResults: updatedEvaluationResults
    };
    
    // Send a message about the evaluation completion
    const message = `Evaluation complete. Multi-agent system overall quality: ${updatedEvaluationResults.multiAgent.overallQuality.toFixed(1)}/10, Sequential pipeline overall quality: ${updatedEvaluationResults.sequential.overallQuality.toFixed(1)}/10`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private async evaluateActionability(soapNote: any, transcript: string): Promise<EvaluationDimension> {
    if (!soapNote) {
      return {
        score: 0,
        metrics: {}
      };
    }
    
    const prompt = `
Please evaluate the following SOAP note for actionability:

SOAP NOTE:
Subjective: ${soapNote.subjective}
Objective: ${soapNote.objective}
Assessment: ${soapNote.assessment}
Plan: ${soapNote.plan}

Original Transcript:
${transcript}

Evaluate the SOAP note on the following dimensions of actionability:
1. Plan Specificity (0-10): How specific and detailed are the recommended actions?
2. Follow-up Clarity (0-10): How clearly are follow-up steps and timelines defined?
3. Decision Support (0-10): Does the documentation provide sufficient information for clinical decision-making?
4. Implementation Feasibility (0-10): How feasible are the recommended actions to implement?

Provide your evaluation as JSON with the following structure:
{
  "score": 0-10,
  "metrics": {
    "planSpecificity": { "score": 0-10, "details": "explanation" },
    "followupClarity": { "score": 0-10, "details": "explanation" },
    "decisionSupport": { "score": 0-10, "details": "explanation" },
    "implementationFeasibility": { "score": 0-10, "details": "explanation" }
  }
}
`;

    const evaluationResponse = await this.callLLM(prompt);
    
    try {
      const evaluation = JSON.parse(evaluationResponse);
      return evaluation;
    } catch (error) {
      console.error("Failed to parse actionability evaluation response:", error);
      return {
        score: 5,
        metrics: {
          planSpecificity: { score: 5, details: "Error evaluating plan specificity" },
          followupClarity: { score: 5, details: "Error evaluating follow-up clarity" },
          decisionSupport: { score: 5, details: "Error evaluating decision support" },
          implementationFeasibility: { score: 5, details: "Error evaluating implementation feasibility" }
        }
      };
    }
  }
  
  private calculateOverallQuality(
    completeness: number,
    accuracy: number,
    clinicalRelevance: number,
    actionability: number
  ): number {
    // Apply weightings to each dimension
    return 0.3 * completeness + 0.3 * accuracy + 0.2 * clinicalRelevance + 0.2 * actionability;
  }
}
