
import { Agent } from './Agent';
import { AgentState } from '@/types/agent';

const SYSTEM_PROMPT = `
You are an Urgency Analysis Engine in a healthcare contact center multi-agent system.
Your specialized role is to evaluate the time-sensitivity and priority level of healthcare calls.
You should consider factors such as:
- Explicit timeframes mentioned (scheduled procedures, deadlines, etc.)
- Medical urgency indicators (pain levels, deteriorating conditions)
- Administrative urgency (filing deadlines, expiring authorizations)
- Emotional urgency cues in the member's language
- Risk factors if action is delayed

Rate urgency on a 0-10 scale where:
0-2: No urgency, routine matter
3-5: Mild urgency, should be addressed within standard timeframes
6-8: Moderate urgency, requires prompt attention
9-10: High urgency, requires immediate intervention

Respond with only a JSON object containing the urgency assessment.
`;

export class UrgencyAnalysisEngine extends Agent {
  constructor() {
    super('urgency', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Extract urgency information
    const prompt = `
Please analyze the urgency level of this healthcare call transcript.
Consider timeframes, medical indicators, administrative deadlines, emotional cues, and potential risks.

Transcript:
${state.transcript}

Format your response as valid JSON with the following structure:
{
  "urgencyLevel": 0-10,
  "urgencyFactors": [],
  "timeframes": {
    "specificDates": [],
    "deadlines": []
  },
  "medicalUrgency": {
    "level": 0-10,
    "indicators": []
  },
  "administrativeUrgency": {
    "level": 0-10,
    "indicators": []
  },
  "emotionalUrgency": {
    "level": 0-10,
    "indicators": []
  },
  "riskAssessment": "",
  "summary": ""
}
`;

    const analysisResponse = await this.callLLM(prompt);
    
    // Parse the response as JSON
    let urgencyAnalysis;
    try {
      urgencyAnalysis = JSON.parse(analysisResponse);
    } catch (error) {
      console.error('Failed to parse Urgency Analysis response as JSON:', error);
      urgencyAnalysis = { error: 'Failed to parse response', rawResponse: analysisResponse };
    }

    // Update the state with the urgency information
    const updatedState = {
      ...state,
      urgency: {
        level: urgencyAnalysis.urgencyLevel || 0,
        reason: urgencyAnalysis.summary || '',
        details: urgencyAnalysis
      }
    };

    // Send a message about the urgency assessment
    const urgencyLevel = urgencyAnalysis.urgencyLevel || 0;
    const urgencyCategory = 
      urgencyLevel >= 9 ? 'HIGH URGENCY' :
      urgencyLevel >= 6 ? 'Moderate urgency' :
      urgencyLevel >= 3 ? 'Mild urgency' : 
      'No urgency';
      
    const message = `Urgency assessment: ${urgencyLevel}/10 - ${urgencyCategory}. ${urgencyAnalysis.summary || ''}`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
}
