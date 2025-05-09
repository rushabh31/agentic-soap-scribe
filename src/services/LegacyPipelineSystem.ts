
import { AgentState, SOAPNote, CallDisposition } from '@/types/agent';
import { callApi } from './apiService';

export class LegacyPipelineSystem {
  async processTranscript(
    transcript: string,
    progressCallback?: (step: number, total: number, message: string) => void
  ): Promise<{
    soapNote: SOAPNote;
    disposition: string;
    sentiment: string;
  }> {
    try {
      // Step 1: Determine call disposition
      if (progressCallback) progressCallback(1, 3, "Determining call disposition...");
      const disposition = await this.determineDisposition(transcript);
      
      // Step 2: Generate SOAP note
      if (progressCallback) progressCallback(2, 3, "Generating SOAP note...");
      const soapNote = await this.generateSOAPNote(transcript, disposition);
      
      // Step 3: Analyze sentiment
      if (progressCallback) progressCallback(3, 3, "Analyzing sentiment...");
      const sentiment = await this.analyzeSentiment(transcript);
      
      return {
        soapNote,
        disposition,
        sentiment
      };
    } catch (error) {
      console.error("Error processing transcript in legacy system:", error);
      // Return empty default results in case of error
      return {
        soapNote: {
          subjective: "Error generating note",
          objective: "Error generating note",
          assessment: "Error generating note",
          plan: "Error generating note"
        },
        disposition: "Error",
        sentiment: "neutral"
      };
    }
  }
  
  private async determineDisposition(transcript: string): Promise<string> {
    try {
      const messages = [
        { 
          role: 'system', 
          content: 'You are an expert healthcare call classifier. Analyze the transcript and classify it as one of the following types: authorization, claims_inquiry, benefits, grievance, enrollment, general.' 
        },
        { role: 'user', content: transcript }
      ];
      
      const response = await callApi(messages);
      
      // Extract disposition from response
      const dispositionMatch = response.match(/\b(authorization|claims_inquiry|benefits|grievance|enrollment|general)\b/i);
      return dispositionMatch ? dispositionMatch[0].toLowerCase() as CallDisposition : 'general';
    } catch (error) {
      console.error("Error determining disposition:", error);
      return "general";
    }
  }
  
  private async generateSOAPNote(transcript: string, disposition: string): Promise<SOAPNote> {
    try {
      const messages = [
        { 
          role: 'system', 
          content: `You are an expert healthcare documentation specialist focusing on ${disposition} calls. Generate a detailed SOAP note from the transcript provided. Format your response with exactly these sections: SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN.` 
        },
        { role: 'user', content: transcript }
      ];
      
      const response = await callApi(messages);
      
      // Parse SOAP sections
      const soapNote: SOAPNote = {
        subjective: this.extractSection(response, 'SUBJECTIVE'),
        objective: this.extractSection(response, 'OBJECTIVE'),
        assessment: this.extractSection(response, 'ASSESSMENT'),
        plan: this.extractSection(response, 'PLAN')
      };
      
      return soapNote;
    } catch (error) {
      console.error("Error generating SOAP note:", error);
      return {
        subjective: "Error generating subjective section",
        objective: "Error generating objective section",
        assessment: "Error generating assessment section",
        plan: "Error generating plan section"
      };
    }
  }
  
  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=(?:SUBJECTIVE|OBJECTIVE|ASSESSMENT|PLAN):|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : `No ${sectionName.toLowerCase()} information provided`;
  }
  
  private async analyzeSentiment(transcript: string): Promise<string> {
    try {
      const messages = [
        { 
          role: 'system', 
          content: 'You are an expert sentiment analyzer for healthcare calls. Analyze the transcript and classify the overall sentiment as positive, neutral, or negative.' 
        },
        { role: 'user', content: transcript }
      ];
      
      const response = await callApi(messages);
      
      // Extract sentiment from response
      if (response.toLowerCase().includes('positive')) return 'positive';
      if (response.toLowerCase().includes('negative')) return 'negative';
      return 'neutral';
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return "neutral";
    }
  }
}
