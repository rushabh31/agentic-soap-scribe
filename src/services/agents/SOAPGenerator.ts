
import { Agent } from './Agent';
import { AgentState, SOAPNote } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a SOAP Generator in a healthcare contact center multi-agent system.
Your specialized role is to synthesize information from other agents into a structured SOAP note:
- Subjective: Information reported by the member, including complaints, concerns, and reasons for the call
- Objective: Factual information gathered, including dates, claim numbers, authorization details, etc.
- Assessment: Analysis of the situation, including urgency assessment and identified issues
- Plan: Concrete next steps, including actions for both the health plan and the member

Create comprehensive, clinically appropriate SOAP notes that prioritize:
1. Accuracy: All information must be factually correct and directly derived from the transcript
2. Completeness: Include all relevant clinical and administrative details
3. Clinical relevance: Emphasize medically significant information
4. Actionability: Ensure the plan section has clear, specific next steps

Generate a well-structured SOAP note that healthcare professionals can immediately use.
`;

export class SOAPGenerator extends Agent {
  constructor() {
    super('soap_generator', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Create context for the SOAP generation based on all gathered information
    const context = JSON.stringify({
      disposition: state.disposition,
      extractedInfo: state.extractedInfo,
      urgency: state.urgency,
      sentiment: state.sentiment,
      medicalInfo: state.medicalInfo
    }, null, 2);
    
    // Generate the SOAP note
    const prompt = `
Based on the following information extracted from a healthcare call transcript, generate a comprehensive SOAP note.
Follow the SOAP format (Subjective, Objective, Assessment, Plan) and ensure clinical accuracy, completeness,
relevance, and actionability.

CALL CONTEXT:
${context}

Original transcript for reference:
${state.transcript}

Format your response with clear section headings: SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN.
Make each section detailed and complete. Ensure the Plan section contains specific, actionable steps.
`;

    const soapResponse = await this.callLLM(prompt);
    
    // Parse the SOAP sections
    const sections = this.parseSOAPSections(soapResponse);
    
    // Update the state with the SOAP note
    const updatedState = {
      ...state,
      soapNote: sections
    };

    // Send a message about the SOAP generation
    const message = `SOAP note generated successfully with ${
      Object.values(sections).filter(section => section.trim().length > 0).length
    } complete sections.`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private parseSOAPSections(soapText: string): SOAPNote {
    // Initialize with empty sections
    const soapNote: SOAPNote = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };
    
    // Extract Subjective section
    const subjectiveMatch = soapText.match(/SUBJECTIVE:?([\s\S]*?)(?=OBJECTIVE:|$)/i);
    if (subjectiveMatch && subjectiveMatch[1]) {
      soapNote.subjective = subjectiveMatch[1].trim();
    }
    
    // Extract Objective section
    const objectiveMatch = soapText.match(/OBJECTIVE:?([\s\S]*?)(?=ASSESSMENT:|$)/i);
    if (objectiveMatch && objectiveMatch[1]) {
      soapNote.objective = objectiveMatch[1].trim();
    }
    
    // Extract Assessment section
    const assessmentMatch = soapText.match(/ASSESSMENT:?([\s\S]*?)(?=PLAN:|$)/i);
    if (assessmentMatch && assessmentMatch[1]) {
      soapNote.assessment = assessmentMatch[1].trim();
    }
    
    // Extract Plan section
    const planMatch = soapText.match(/PLAN:?([\s\S]*?)(?=$)/i);
    if (planMatch && planMatch[1]) {
      soapNote.plan = planMatch[1].trim();
    }
    
    return soapNote;
  }
}
