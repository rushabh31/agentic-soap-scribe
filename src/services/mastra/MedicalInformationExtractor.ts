
import { MastraAgent } from './MastraAgent';
import { AgentState } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

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

export class MedicalInformationExtractor extends MastraAgent {
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

Format your response as valid JSON with the following structure ONLY:
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

    // Call the Mastra agent for extraction
    const result = await super.process(state, prompt);
    
    // Parse the response as JSON
    let medicalInfo;
    try {
      medicalInfo = JSON.parse(result.output);
    } catch (error) {
      console.error('Failed to parse Medical Information Extractor response as JSON:', error);
      medicalInfo = { error: 'Failed to parse response', rawResponse: result.output };
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
    
    const message = {
      id: uuidv4(),
      from: 'medical' as any,
      to: 'all' as any,
      content: `Medical extraction complete. Found ${conditionCount} conditions, ${procedureCount} procedures, and ${symptomCount} symptoms.`,
      timestamp: Date.now()
    };

    return {
      ...updatedState,
      messages: [...updatedState.messages, message]
    };
  }
}
