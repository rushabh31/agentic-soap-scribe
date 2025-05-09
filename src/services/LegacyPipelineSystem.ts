
import { v4 as uuidv4 } from 'uuid';
import { AgentState } from '@/types/agent';
import { callApi, ApiMessage } from './apiService';
import { toast } from 'sonner';
import { SOAPNote } from '@/types/agent';
import { StateGraph } from '@langchain/langgraph';
import { RunnableSequence } from '@langchain/core/runnables';

export class LegacyPipelineSystem {
  private dispositionSystemPrompt = `
You are a Call Disposition Classifier in a healthcare contact center system.
Your job is to carefully analyze transcripts of healthcare calls and accurately classify them into one of the following call types:
- authorization: Calls about procedure approvals, medical necessity, and documentation requirements
- claims_inquiry: Calls about claim status, denials, explanations of payments, etc.
- benefits: Calls about coverage, eligibility, and benefit explanations
- grievance: Calls expressing complaints or dissatisfaction with service or care
- enrollment: Calls about signing up, changing plans, or membership status
- general: Other call types not falling into the above categories

Be very precise in your analysis and base your classification solely on the content of the transcript.
`;

  private soapGenerationPrompt = `
You are a SOAP Note Generator in a healthcare contact center system.
Your specialized role is to synthesize information from call transcripts into a structured SOAP note:

- Subjective: Information reported by the member, including complaints, concerns, and reasons for the call
- Objective: Factual information gathered, including dates, claim numbers, authorization details, etc.
- Assessment: Analysis of the situation, including urgency assessment and identified issues
- Plan: Concrete next steps, including actions for both the health plan and the member

Create a comprehensive, clinically appropriate SOAP note that prioritizes accuracy, completeness, clinical relevance, and actionability.
`;

  private sentimentAnalysisPrompt = `
You are a Sentiment Analysis Engine in a healthcare contact center system.
Your job is to analyze the sentiment expressed in healthcare call transcripts and categorize the sentiment as:
- Satisfied: Member expresses positive sentiment, satisfaction with service or outcome
- Neutral: Member expresses neither strong positive nor negative sentiment
- Dissatisfied: Member expresses frustration, anger, disappointment, or other negative emotions

Return only the sentiment category (Satisfied, Neutral, or Dissatisfied) without any additional explanation.
`;
  
  constructor() {
    // No initialization needed
  }
  
  public async processTranscript(
    transcript: string,
    progressCallback?: (step: number, totalSteps: number, message: string) => void
  ): Promise<{ soapNote: SOAPNote, disposition: string, sentiment: string }> {
    try {
      // Create a StateGraph for the legacy pipeline
      const builder = new StateGraph({
        channels: {
          disposition: { value: "" },
          soapNote: { value: {} as SOAPNote },
          sentiment: { value: "" },
          transcript: { value: "" }
        }
      });

      // Step 1: Determine call disposition
      builder.addNode("disposition", async (state) => {
        if (progressCallback) progressCallback(1, 3, "Determining call disposition...");
        
        const dispositionMessages: ApiMessage[] = [
          { role: 'system', content: this.dispositionSystemPrompt },
          { role: 'user', content: `
Please analyze the following healthcare call transcript and classify it into one of the call types.
Transcript:
${state.transcript}

Respond with ONLY the classification as a single word, with no additional text.` }
        ];
        
        const disposition = await callApi(dispositionMessages);
        return { disposition: disposition.trim().toLowerCase() };
      });

      // Step 2: Generate SOAP note
      builder.addNode("soap", async (state) => {
        if (progressCallback) progressCallback(2, 3, "Generating SOAP note...");
        
        const soapMessages: ApiMessage[] = [
          { role: 'system', content: this.soapGenerationPrompt },
          { role: 'user', content: `
Based on the following healthcare call transcript with disposition classified as ${state.disposition}, generate a comprehensive SOAP note.
Follow the SOAP format (Subjective, Objective, Assessment, Plan) and ensure clinical accuracy, completeness,
relevance, and actionability.

TRANSCRIPT:
${state.transcript}

Format your response with clear section headings: SUBJECTIVE, OBJECTIVE, ASSESSMENT, and PLAN.
Make each section detailed and complete. Ensure the Plan section contains specific, actionable steps.` }
        ];
        
        const soapText = await callApi(soapMessages);
        const soapNote = this.parseSOAPSections(soapText);
        
        return { soapNote };
      });

      // Step 3: Analyze sentiment
      builder.addNode("sentiment", async (state) => {
        if (progressCallback) progressCallback(3, 3, "Analyzing sentiment...");
        
        const sentimentMessages: ApiMessage[] = [
          { role: 'system', content: this.sentimentAnalysisPrompt },
          { role: 'user', content: `
Analyze the sentiment in the following healthcare call transcript and categorize it as Satisfied, Neutral, or Dissatisfied.
Only respond with one of these three sentiment categories and no other text.

TRANSCRIPT:
${state.transcript}` }
        ];
        
        const sentiment = await callApi(sentimentMessages);
        return { sentiment: sentiment.trim() };
      });

      // Define edges in the graph
      builder.addEdge("disposition", "soap");
      builder.addEdge("soap", "sentiment");
      
      // Define the finish point
      builder.setFinishPoint("sentiment");
      
      // Set the entry point
      builder.setEntryPoint("disposition");
      
      // Compile and run the graph
      const graph = builder.compile();
      const result = await graph.invoke({
        disposition: "",
        soapNote: {} as SOAPNote,
        sentiment: "",
        transcript
      });
      
      return {
        soapNote: result.soapNote,
        disposition: result.disposition,
        sentiment: result.sentiment
      };
      
    } catch (error) {
      console.error('Error in legacy pipeline system:', error);
      toast.error(`Processing error in legacy system: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
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
