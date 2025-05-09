
import { LangGraphAgent } from './LangGraphAgent';
import { AgentState, EvaluationResults, MedicalInfo } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `
You are an Evaluation Engine in a healthcare contact center multi-agent system.
Your job is to evaluate the quality of generated SOAP notes and other outputs
from both the multi-agent system and the sequential legacy system.

You should assess:
1. Completeness - Are all relevant details included?
2. Accuracy - Is all information factually correct?
3. Clinical Relevance - Is the information clinically appropriate?
4. Actionability - Are the plans and recommendations clear?

Provide detailed evaluation with metrics and scores for each dimension.
Respond in JSON format with comprehensive evaluation data.
`;

export class EvaluationEngine extends LangGraphAgent {
  constructor() {
    super('evaluation', SYSTEM_PROMPT);
  }

  public async processState(state: AgentState): Promise<AgentState> {
    // Only proceed if we have a SOAP note to evaluate
    if (!state.soapNote) {
      const message = {
        id: uuidv4(),
        from: 'evaluation' as any,
        to: 'all' as any,
        content: `Evaluation skipped: No SOAP note available to evaluate.`,
        timestamp: Date.now()
      };
      
      return {
        ...state,
        messages: [...state.messages, message]
      };
    }
    
    // Create context about the state for evaluation
    // Use the MedicalInfo type with safe access
    const medicalInfo: MedicalInfo = state.medicalInfo || { conditions: [], procedures: [] };
    // Get counts safely with optional chaining and nullish coalescing
    const conditionCount = medicalInfo.conditions?.length ?? 0;
    const procedureCount = medicalInfo.procedures?.length ?? 0;
    
    const prompt = `
Please evaluate the quality of this SOAP note in the context of the original transcript.
Consider completeness, accuracy, clinical relevance, and actionability.

Original Transcript:
${state.transcript || ""}

Medical Information Extracted:
- Number of conditions: ${conditionCount}
- Number of procedures: ${procedureCount}

SOAP Note to Evaluate:
SUBJECTIVE:
${state.soapNote.subjective}

OBJECTIVE:
${state.soapNote.objective}

ASSESSMENT:
${state.soapNote.assessment}

PLAN:
${state.soapNote.plan}

Provide a comprehensive evaluation in JSON format with the following structure:
{
  "overallScore": 85,
  "summary": "Overall evaluation summary",
  "recommendations": ["specific suggestion 1", "specific suggestion 2"],
  "dimensions": {
    "completeness": {
      "score": 90,
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1"],
      "analysis": "detailed analysis"
    },
    "accuracy": {
      "score": 85,
      "strengths": ["strength 1"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "analysis": "detailed analysis"
    },
    "clinicalRelevance": {
      "score": 80,
      "strengths": ["strength 1"],
      "weaknesses": ["weakness 1"],
      "analysis": "detailed analysis"
    },
    "actionability": {
      "score": 85,
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1"],
      "analysis": "detailed analysis"
    }
  }
}
`;

    // Call the LangGraph agent for evaluation
    const result = await this.process(state, prompt);
    
    // Parse the response as JSON
    let evaluationResults: EvaluationResults;
    try {
      const parsedResult = JSON.parse(result.output);
      
      // Structure the evaluation results
      evaluationResults = {
        overallScore: parsedResult.overallScore || 0,
        summary: parsedResult.summary || "",
        recommendations: parsedResult.recommendations || [],
        multiAgent: {
          soapNote: state.soapNote,
          completeness: parsedResult.dimensions?.completeness,
          accuracy: parsedResult.dimensions?.accuracy,
          clinicalRelevance: parsedResult.dimensions?.clinicalRelevance,
          actionability: parsedResult.dimensions?.actionability,
          overallQuality: parsedResult.overallScore
        },
        sequential: {
          // This would be populated later when comparing to another system
          overallQuality: 0
        }
      };
    } catch (error) {
      console.error('Failed to parse Evaluation Engine response as JSON:', error);
      
      // Create default evaluation results
      evaluationResults = {
        overallScore: 0,
        summary: "Error parsing evaluation results",
        multiAgent: {
          soapNote: state.soapNote,
          overallQuality: 0
        },
        sequential: {
          overallQuality: 0
        }
      };
    }

    // Update the state with the evaluation results
    const updatedState = {
      ...state,
      evaluationResults
    };

    // Send a message about the evaluation
    const score = evaluationResults.overallScore;
    const scoreCategory = 
      score >= 90 ? 'Excellent' :
      score >= 80 ? 'Very Good' :
      score >= 70 ? 'Good' :
      score >= 60 ? 'Satisfactory' :
      'Needs Improvement';
      
    const message = {
      id: uuidv4(),
      from: 'evaluation' as any,
      to: 'all' as any,
      content: `Evaluation complete. Overall score: ${score}/100 (${scoreCategory}). ${evaluationResults.summary || ''}`,
      timestamp: Date.now()
    };

    return {
      ...updatedState,
      messages: [...updatedState.messages, message]
    };
  }
}
