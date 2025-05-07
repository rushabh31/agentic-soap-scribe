
import { Agent } from './Agent';
import { AgentState } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Claims Specialist Agent in a healthcare contact center multi-agent system.
Your expertise is in extracting information related to claims inquiries, including:
- Claim numbers and identifiers
- Dates of service
- Provider information
- Denial reasons and codes
- Appeal status and deadlines
- Payment details and explanations
- Member financial responsibility

Respond in JSON format when extracting information. Be precise and thorough in your analysis.
`;

export class ClaimsAgent extends Agent {
  constructor() {
    super('claims', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Extract claims-specific information
    const prompt = `
Please extract all claims-related information from this healthcare call transcript.
Focus on claim numbers, dates of service, provider information, denial reasons,
appeal status, payment details, and member financial responsibility.

Transcript:
${state.transcript}

Format your response as valid JSON with the following structure:
{
  "claimIdentifiers": {
    "claimNumber": "",
    "memberID": "",
    "otherReferences": []
  },
  "serviceDetails": {
    "dateOfService": "",
    "serviceType": "",
    "placeOfService": ""
  },
  "provider": {
    "name": "",
    "npi": "",
    "network": ""
  },
  "denialInfo": {
    "isDenied": true/false,
    "reasons": [],
    "codes": [],
    "details": ""
  },
  "appealInfo": {
    "appealFiled": true/false,
    "status": "",
    "deadline": "",
    "requiredDocuments": []
  },
  "financialInfo": {
    "billed": "",
    "allowed": "",
    "paid": "",
    "memberResponsibility": "",
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
      console.error('Failed to parse Claims Agent response as JSON:', error);
      extractedInfo = { error: 'Failed to parse response', rawResponse: extractionResponse };
    }

    // Update the state with the extracted information
    const updatedState = {
      ...state,
      extractedInfo: {
        ...state.extractedInfo,
        claims: extractedInfo
      }
    };

    // Send a message summarizing findings
    const claimNumber = extractedInfo.claimIdentifiers?.claimNumber || 'unknown claim';
    const isDenied = extractedInfo.denialInfo?.isDenied ? 'denied' : 'not denied';
    const appealStatus = extractedInfo.appealInfo?.status || 'No appeal information';
    
    const message = `Claims analysis complete for ${claimNumber}. Claim status: ${isDenied}. ${appealStatus}.`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
}
