
import { Agent } from './Agent';
import { AgentState } from '@/types/agent';

const SYSTEM_PROMPT = `
You are an Authorization Specialist Agent in a healthcare contact center multi-agent system.
Your expertise is in extracting information related to authorization requests, including:
- Procedure details (type, CPT/HCPCS codes if mentioned)
- Medical necessity information
- Provider details
- Timeline and urgency factors
- Previous authorization attempts
- Documentation status (what's submitted, what's missing)

Respond in JSON format when extracting information. Be precise and thorough in your analysis.
`;

export class AuthorizationAgent extends Agent {
  constructor() {
    super('authorization', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Extract authorization-specific information
    const prompt = `
Please extract all authorization-related information from this healthcare call transcript.
Focus on procedure details, medical necessity, provider information, timeline/urgency, previous authorization attempts,
and documentation status.

Transcript:
${state.transcript}

Format your response as valid JSON with the following structure:
{
  "procedure": {
    "type": "",
    "codes": [],
    "details": ""
  },
  "medicalNecessity": {
    "indication": "",
    "supportingEvidence": ""
  },
  "provider": {
    "name": "",
    "specialty": "",
    "network": ""
  },
  "timeline": {
    "scheduledDate": "",
    "urgencyLevel": 0-10,
    "urgencyReason": ""
  },
  "previousAttempts": {
    "hasAttempted": true/false,
    "details": ""
  },
  "documentation": {
    "submitted": [],
    "missing": [],
    "notes": ""
  }
}
`;

    const extractionResponse = await this.callLLM(prompt);
    
    // Parse the response as JSON
    let extractedInfo;
    try {
      extractedInfo = JSON.parse(extractionResponse);
    } catch (error) {
      console.error('Failed to parse Authorization Agent response as JSON:', error);
      extractedInfo = { error: 'Failed to parse response', rawResponse: extractionResponse };
    }

    // Update the state with the extracted information
    const updatedState = {
      ...state,
      extractedInfo: {
        ...state.extractedInfo,
        authorization: extractedInfo
      }
    };

    // Send a message summarizing findings
    const urgencyLevel = extractedInfo.timeline?.urgencyLevel || 'unknown';
    const procedureType = extractedInfo.procedure?.type || 'procedure';
    const missingDocs = extractedInfo.documentation?.missing?.length > 0 
      ? `Missing documentation: ${extractedInfo.documentation.missing.join(', ')}` 
      : 'No missing documentation identified';
      
    const message = `Authorization analysis complete for ${procedureType}. Urgency level: ${urgencyLevel}/10. ${missingDocs}`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
}
