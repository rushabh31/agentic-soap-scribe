
import { LangGraphAgent } from './LangGraphAgent';
import { AgentState } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `
You are an Advanced Clinical Evaluation Engine specializing in analyzing healthcare documentation, particularly SOAP notes.
Your task is to provide comprehensive, data-driven evaluations across multiple dimensions:

1. Clinical Accuracy (40% of total score):
   - Evidence-based assessment
   - Proper clinical terminology
   - Appropriate medical reasoning
   - Consistency with presented data

2. Documentation Completeness (30% of total score):
   - Coverage of all relevant information
   - Appropriate level of detail
   - Structured organization
   - No critical omissions

3. Actionability (30% of total score):
   - Clear next steps
   - Specific timelines
   - Assigned responsibilities
   - Measurable outcomes

Provide your evaluation as a precise, structured JSON report with both qualitative analysis and quantitative scoring (0-100 for each dimension).
Include specific strengths, areas for improvement, and actionable recommendations.
`;

export class EvaluationEngine extends LangGraphAgent {
  constructor() {
    super('evaluation', SYSTEM_PROMPT);
  }

  public async processState(state: AgentState): Promise<AgentState> {
    // Only evaluate if we have a SOAP note
    if (!state.soapNote) {
      return this.sendMessage(state, 'Cannot evaluate without a SOAP note');
    }
    
    // Create evaluation prompt
    const soapNote = state.soapNote;
    const medicalInfo = state.medicalInfo || {};
    const urgency = state.urgency || { level: 'Not assessed', reason: '' };
    const disposition = state.disposition || 'general';
    
    const prompt = `
Please evaluate the quality of this healthcare SOAP note based on clinical accuracy, documentation completeness, and actionability.

CONTEXT:
Call Type: ${disposition}
Urgency Level: ${urgency.level || 'Not assessed'} - ${urgency.reason || ''}
Medical Information: Patient has ${medicalInfo.conditions?.length || 0} conditions, ${medicalInfo.procedures?.length || 0} procedures identified

SOAP NOTE TO EVALUATE:
SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}

Provide your detailed evaluation as JSON with the following structure:
{
  "clinicalAccuracy": {
    "score": 0-100,
    "strengths": [],
    "weaknesses": [],
    "analysis": ""
  },
  "completeness": {
    "score": 0-100,
    "strengths": [],
    "weaknesses": [],
    "analysis": ""
  },
  "actionability": {
    "score": 0-100,
    "strengths": [],
    "weaknesses": [],
    "analysis": ""
  },
  "overallScore": 0-100,
  "summary": "",
  "recommendations": []
}
`;

    // Call the LangGraph agent for evaluation
    const result = await this.process(state, prompt);
    
    // Parse the evaluation results
    let evaluation;
    try {
      evaluation = JSON.parse(result.output);
    } catch (error) {
      console.error('Failed to parse Evaluation results as JSON:', error);
      evaluation = { 
        error: 'Failed to parse evaluation results', 
        rawResponse: result.output,
        overallScore: 0
      };
    }

    // Calculate weighted overall score if not already provided
    if (!evaluation.overallScore && evaluation.clinicalAccuracy?.score) {
      const clinicalScore = evaluation.clinicalAccuracy.score * 0.4;
      const completenessScore = evaluation.completeness.score * 0.3;
      const actionabilityScore = evaluation.actionability.score * 0.3;
      evaluation.overallScore = Math.round(clinicalScore + completenessScore + actionabilityScore);
    }

    // Update the state with the evaluation results
    const updatedState = {
      ...state,
      evaluationResults: evaluation
    };

    // Send a message with the evaluation summary
    return this.sendMessage(updatedState, `
Evaluation Complete: Overall Score ${evaluation.overallScore || 0}/100

Clinical Accuracy: ${evaluation.clinicalAccuracy?.score || 0}/100
Completeness: ${evaluation.completeness?.score || 0}/100
Actionability: ${evaluation.actionability?.score || 0}/100

Summary: ${evaluation.summary || "No summary available."}
    `);
  }
  
  private sendMessage(state: AgentState, content: string): AgentState {
    const message = {
      id: uuidv4(),
      from: 'evaluation' as any, // Type casting to match AgentType
      to: 'all' as any,
      content,
      timestamp: Date.now()
    };

    return {
      ...state,
      messages: [...state.messages, message]
    };
  }
}
