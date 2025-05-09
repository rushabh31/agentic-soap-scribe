
import { v4 as uuidv4 } from 'uuid';
import { SOAPNote, CallDisposition } from '@/types/agent';
import { ApiMessage, callApi } from './apiService';
import { toast } from 'sonner';

export class LegacyPipelineSystem {
  constructor() {}
  
  public async processTranscript(
    transcript: string,
    progressCallback?: (step: number, total: number, message: string) => void
  ): Promise<{ soapNote: SOAPNote; disposition: string; sentiment: string }> {
    try {
      // Step 1: Determine call disposition
      if (progressCallback) progressCallback(1, 3, "Analyzing call disposition...");
      
      const disposition = await this.determineDisposition(transcript);
      
      // Step 2: Extract medical information
      if (progressCallback) progressCallback(2, 3, "Extracting medical information...");
      
      const medicalInfo = await this.extractMedicalInfo(transcript, disposition);
      
      // Step 3: Generate SOAP note
      if (progressCallback) progressCallback(3, 3, "Generating SOAP note...");
      
      const soapNote = await this.generateSOAPNote(transcript, disposition, medicalInfo);
      
      return {
        soapNote,
        disposition,
        sentiment: "neutral"  // Default sentiment
      };
    } catch (error) {
      console.error('Error in legacy pipeline:', error);
      toast.error(`Legacy pipeline error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return default structure in case of error
      return {
        soapNote: {
          subjective: "Error generating subjective section",
          objective: "Error generating objective section",
          assessment: "Error generating assessment section", 
          plan: "Error generating plan section"
        },
        disposition: "general",
        sentiment: "neutral"
      };
    }
  }
  
  private async determineDisposition(transcript: string): Promise<string> {
    // Simple prompt to determine call disposition
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are an expert healthcare call classifier. Determine the primary reason for this call from these categories: authorization, claims_inquiry, benefits, grievance, enrollment, general.` 
      },
      { 
        role: 'user', 
        content: `Analyze this transcript and respond ONLY with the single most appropriate category name:\n\n${transcript}`
      }
    ];
    
    try {
      const response = await callApi(messages);
      // Clean up response to get just the category name
      const disposition = response.trim().toLowerCase();
      
      // Validate against known dispositions
      const validDispositions: CallDisposition[] = [
        'authorization', 'claims_inquiry', 'benefits', 'grievance', 'enrollment', 'general'
      ];
      
      if (validDispositions.includes(disposition as CallDisposition)) {
        return disposition;
      }
      return 'general';  // Default to general if invalid
    } catch (error) {
      console.error('Error determining disposition:', error);
      return 'general';  // Default to general on error
    }
  }
  
  private async extractMedicalInfo(transcript: string, disposition: string): Promise<any> {
    // Extract medical information based on disposition
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a medical information extraction specialist. Extract key medical information from this healthcare call transcript categorized as: ${disposition}.` 
      },
      { 
        role: 'user', 
        content: `Extract key medical information from this transcript in JSON format with relevant fields based on the call category:\n\n${transcript}`
      }
    ];
    
    try {
      const response = await callApi(messages);
      
      // Attempt to parse as JSON
      try {
        return JSON.parse(response);
      } catch {
        // If not valid JSON, return as raw text
        return { raw: response };
      }
    } catch (error) {
      console.error('Error extracting medical info:', error);
      return {};  // Return empty object on error
    }
  }
  
  private async generateSOAPNote(transcript: string, disposition: string, medicalInfo: any): Promise<SOAPNote> {
    // Generate SOAP note based on extracted information
    const medicalInfoStr = JSON.stringify(medicalInfo);
    
    const messages: ApiMessage[] = [
      { 
        role: 'system', 
        content: `You are a healthcare documentation specialist. Generate a comprehensive SOAP note for this call.` 
      },
      { 
        role: 'user', 
        content: `Generate a SOAP note based on this transcript:
        
        Transcript: ${transcript}
        
        Disposition: ${disposition}
        
        Extracted Information: ${medicalInfoStr}
        
        Format with clear SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN sections. Be concise but thorough.`
      }
    ];
    
    try {
      const response = await callApi(messages);
      
      // Parse SOAP sections
      return this.parseSOAPSections(response);
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      return {
        subjective: "Error generating subjective section",
        objective: "Error generating objective section",
        assessment: "Error generating assessment section", 
        plan: "Error generating plan section"
      };
    }
  }
  
  private parseSOAPSections(text: string): SOAPNote {
    // Initialize with empty sections
    const soapNote: SOAPNote = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };
    
    // Extract Subjective section
    const subjectiveMatch = text.match(/SUBJECTIVE:?([\s\S]*?)(?=OBJECTIVE:|$)/i);
    if (subjectiveMatch && subjectiveMatch[1]) {
      soapNote.subjective = subjectiveMatch[1].trim();
    }
    
    // Extract Objective section
    const objectiveMatch = text.match(/OBJECTIVE:?([\s\S]*?)(?=ASSESSMENT:|$)/i);
    if (objectiveMatch && objectiveMatch[1]) {
      soapNote.objective = objectiveMatch[1].trim();
    }
    
    // Extract Assessment section
    const assessmentMatch = text.match(/ASSESSMENT:?([\s\S]*?)(?=PLAN:|$)/i);
    if (assessmentMatch && assessmentMatch[1]) {
      soapNote.assessment = assessmentMatch[1].trim();
    }
    
    // Extract Plan section
    const planMatch = text.match(/PLAN:?([\s\S]*?)(?=$)/i);
    if (planMatch && planMatch[1]) {
      soapNote.plan = planMatch[1].trim();
    }
    
    return soapNote;
  }
}
