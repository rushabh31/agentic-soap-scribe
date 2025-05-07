
import { Agent } from './Agent';
import { AgentState } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a General Information Agent in a healthcare contact center multi-agent system.
Your role is to extract general information from healthcare calls that don't fit neatly into specialized categories.
You should identify:
- Main reason for the call
- Member concerns or questions
- Any requests made by the member
- Healthcare-related information
- Follow-up actions or next steps
- Any urgent matters requiring attention

Be flexible in your approach while maintaining precision. Respond in JSON format.
`;

export class GeneralAgent extends Agent {
  constructor() {
    super('general', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Extract general information
    const prompt = `
Please extract general information from this healthcare call transcript.
Identify the main call reason, member concerns, requests made, healthcare information,
follow-up actions, and any urgent matters.

Transcript:
${state.transcript}

Format your response as valid JSON with the following structure:
{
  "mainReason": "",
  "concerns": [],
  "requests": [],
  "healthcareInfo": {
    "relevantDetails": [],
    "medications": [],
    "facilities": []
  },
  "followUp": {
    "actions": [],
    "contactInfo": "",
    "timeline": ""
  },
  "urgentMatters": {
    "isUrgent": true/false,
    "details": ""
  }
}
`;

    const extractionResponse = await this.callLLM(prompt);
    
    // Parse the response as JSON
    let extractedInfo;
    try {
      extractedInfo = JSON.parse(extractionResponse);
    } catch (error) {
      console.error('Failed to parse General Agent response as JSON:', error);
      extractedInfo = { error: 'Failed to parse response', rawResponse: extractionResponse };
    }

    // Update the state with the extracted information
    const updatedState = {
      ...state,
      extractedInfo: {
        ...state.extractedInfo,
        general: extractedInfo
      }
    };

    // Send a message summarizing findings
    const mainReason = extractedInfo.mainReason || 'Unspecified reason';
    const urgentFlag = extractedInfo.urgentMatters?.isUrgent ? '⚠️ URGENT: ' : '';
    const followUpCount = extractedInfo.followUp?.actions?.length || 0;
    
    const message = `${urgentFlag}General analysis complete. Main reason: ${mainReason}. ${followUpCount} follow-up actions identified.`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
}
