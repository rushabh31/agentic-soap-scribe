
import { Agent } from './Agent';
import { AgentState } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a Medical Information Extractor in a healthcare contact center multi-agent system.
Your specialized role is to identify and extract medical information from healthcare calls, including:
- Medical conditions mentioned (diagnosed or suspected)
- Procedures and treatments discussed
- Symptoms described by the member
- Medications mentioned (names, dosages, frequency)
- Relevant medical history
- Timeline of medical events
- Provider specialties and facilities mentioned

Focus on extracting factual medical information with clinical precision.
Respond in JSON format with structured medical information.
`;

export class MedicalInformationExtractor extends Agent {
  constructor() {
    super('medical', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Extract medical information
    const prompt = `
Please extract all medical information from this healthcare call transcript.
Focus on medical conditions, procedures, symptoms, medications, medical history, 
timeline of medical events, and healthcare providers/facilities mentioned.

Transcript:
${state.transcript}

Format your response as valid JSON with the following structure:
{
  "conditions": [
    {
      "name": "",
      "status": "confirmed", "suspected", or "historical",
      "notes": ""
    }
  ],
  "procedures": [
    {
      "name": "",
      "status": "completed", "scheduled", "recommended", or "discussed",
      "details": ""
    }
  ],
  "symptoms": [
    {
      "description": "",
      "duration": "",
      "severity": ""
    }
  ],
  "medications": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "notes": ""
    }
  ],
  "medicalHistory": "",
  "timeline": "",
  "providers": [
    {
      "name": "",
      "specialty": "",
      "facility": ""
    }
  ]
}
`;

    const extractionResponse = await this.callLLM(prompt);
    
    // Parse the response as JSON
    let medicalInfo;
    try {
      medicalInfo = JSON.parse(extractionResponse);
    } catch (error) {
      console.error('Failed to parse Medical Information Extractor response as JSON:', error);
      medicalInfo = { error: 'Failed to parse response', rawResponse: extractionResponse };
    }

    // Update the state with the medical information
    const updatedState = {
      ...state,
      medicalInfo: {
        conditions: medicalInfo.conditions || [],
        procedures: medicalInfo.procedures || [],
        symptoms: medicalInfo.symptoms || [],
        medications: medicalInfo.medications || [],
        medicalHistory: medicalInfo.medicalHistory || '',
        timeline: medicalInfo.timeline || '',
        providers: medicalInfo.providers || []
      }
    };

    // Send a message summarizing the extracted information
    const conditionCount = medicalInfo.conditions?.length || 0;
    const procedureCount = medicalInfo.procedures?.length || 0;
    const symptomCount = medicalInfo.symptoms?.length || 0;
    
    const message = `Medical extraction complete. Found ${conditionCount} conditions, ${procedureCount} procedures, and ${symptomCount} symptoms.`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
}
