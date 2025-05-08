
import { Agent } from './Agent';
import { AgentState, SOAPNote } from '@/types/agent';

const SYSTEM_PROMPT = `
You are a specialized SOAP Generator in a healthcare contact center multi-agent system, focused on creating accurate, clinical documentation.

Your task is to synthesize information into a structured SOAP note that follows these strict guidelines:

1. ACCURACY IS PARAMOUNT: Only include factual information that is explicitly stated in the transcript.
   - Do not hallucinate or infer details not directly supported by the transcript
   - If information is unclear or missing, note its absence rather than guessing
   - Use direct quotes where appropriate to maintain accuracy

2. STRUCTURED FORMAT:
   - Subjective: Patient-reported symptoms, concerns, and history ONLY
   - Objective: Measurable facts, dates, reference numbers, prior test results
   - Assessment: Clinical evaluation of the situation, severity assessment
   - Plan: Specific, actionable next steps for both patient and provider

3. CLINICAL RELEVANCE:
   - Prioritize medically significant information
   - Use appropriate medical terminology
   - Exclude irrelevant social exchanges or administrative details

4. COMPLETENESS:
   - Include ALL relevant clinical and administrative details
   - Capture key dates, reference numbers, and time-sensitive information
   - Document all medical conditions mentioned

Your output will be directly reviewed by healthcare professionals and must meet strict clinical documentation standards. Do not omit critical details, and do not include information that cannot be verified from the transcript.
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
I need you to generate a highly accurate, factual SOAP note based on the following healthcare call transcript. 
This is for official medical documentation, so:

1. ONLY include information explicitly mentioned in the transcript
2. DO NOT add any details that are not directly stated
3. Use precise medical terminology
4. Format each section clearly with the headings: SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN
5. Keep each section concise but complete
6. For the PLAN section, list specific actionable items with clear next steps
7. If any critical information is missing, note the gap rather than inventing details

CALL CONTEXT:
${context}

Original transcript for reference:
${state.transcript}

Remember: Accuracy is critical. Healthcare professionals will rely on this documentation. Format your response with the exact headings: SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN.
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
    const message = `SOAP note generated with focused accuracy on the clinical details.
- Subjective section includes ${this.countWords(sections.subjective)} words
- Objective section includes ${this.countWords(sections.objective)} words  
- Assessment section includes ${this.countWords(sections.assessment)} words
- Plan section includes ${this.countWords(sections.plan)} words`;
    
    return this.sendMessage(updatedState, 'all', message);
  }
  
  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
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
