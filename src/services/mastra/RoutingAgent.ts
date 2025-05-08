
import { MastraAgent } from './MastraAgent';
import { AgentState, CallDisposition } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `
You are a Routing Agent in a healthcare contact center multi-agent system.
Your job is to carefully analyze transcripts of healthcare calls and accurately classify them into one of the following call types:
- authorization: Calls about procedure approvals, medical necessity, and documentation requirements
- claims_inquiry: Calls about claim status, denials, explanations of payments, etc.
- benefits: Calls about coverage, eligibility, and benefit explanations
- grievance: Calls expressing complaints or dissatisfaction with service or care
- enrollment: Calls about signing up, changing plans, or membership status
- general: Other call types not falling into the above categories

Be very precise in your analysis and base your classification solely on the content of the transcript.
Respond ONLY with the call type as a single word, no additional text.
`;

export class RoutingAgent extends MastraAgent {
  constructor() {
    super('routing', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // First, analyze the transcript to determine the call type
    const prompt = `
Please analyze the following healthcare call transcript and classify it into one of the call types:
authorization, claims_inquiry, benefits, grievance, enrollment, or general.

Transcript:
${state.transcript}

Respond with ONLY the classification as a single word, with no additional text.
`;

    // Call the Mastra agent to get the disposition
    const result = await super.process(state, prompt);
    const disposition = result.output.trim().toLowerCase() as CallDisposition;

    // Update the state with the disposition
    const updatedState = {
      ...state,
      disposition
    };

    // Send a message about the disposition
    const message = {
      id: uuidv4(),
      from: 'routing' as any,
      to: 'all' as any,
      content: `Call classified as: ${disposition}. Routing to appropriate specialist agent.`,
      timestamp: Date.now()
    };

    return {
      ...updatedState,
      messages: [...updatedState.messages, message]
    };
  }
}
