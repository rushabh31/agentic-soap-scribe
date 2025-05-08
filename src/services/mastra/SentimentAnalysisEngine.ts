
import { MastraAgent } from './MastraAgent';
import { AgentState, SentimentType } from '@/types/agent';
import { v4 as uuidv4 } from 'uuid';

const SYSTEM_PROMPT = `
You are a Sentiment Analysis Engine in a healthcare contact center multi-agent system.
Your specialized role is to evaluate the emotional tone and sentiment in healthcare calls.
Unlike basic sentiment analysis, you should:
- Analyze sentiment at both overall and sentence level
- Identify sentiment shifts throughout the conversation
- Detect subtle healthcare-specific emotional cues
- Consider context when evaluating emotions
- Recognize both explicit statements and implicit emotional indicators
- Differentiate between clinical language and emotional content

Respond ONLY in valid JSON format with detailed sentiment analysis.
`;

export class SentimentAnalysisEngine extends MastraAgent {
  constructor() {
    super('sentiment', SYSTEM_PROMPT);
  }

  public async process(state: AgentState): Promise<AgentState> {
    // Analyze sentiment
    const prompt = `
Please perform detailed sentiment analysis on this healthcare call transcript.
Analyze overall sentiment, sentence-level sentiment, sentiment shifts, and healthcare-specific emotional cues.

Transcript:
${state.transcript}

Return your analysis ONLY as valid JSON with the following structure:
{
  "overallSentiment": "positive", "neutral", or "negative",
  "sentimentScore": -10 to 10,
  "sentimentShifts": [
    {
      "from": "",
      "to": "",
      "trigger": ""
    }
  ],
  "emotionalHighlights": [
    {
      "text": "",
      "emotion": "",
      "intensity": 0-10
    }
  ],
  "satisfactionPrediction": 0-10,
  "keyEmotions": [],
  "summary": ""
}
`;

    // Call the Mastra agent for analysis
    const result = await super.process(state, prompt);
    
    // Parse the response as JSON
    let sentimentAnalysis;
    try {
      sentimentAnalysis = JSON.parse(result.output);
    } catch (error) {
      console.error('Failed to parse Sentiment Analysis response as JSON:', error);
      sentimentAnalysis = { error: 'Failed to parse response', rawResponse: result.output };
    }

    // Map sentiment score to sentiment type
    let sentimentType: SentimentType = 'neutral';
    const sentimentScore = sentimentAnalysis.sentimentScore || 0;
    
    if (sentimentScore > 3) sentimentType = 'positive';
    else if (sentimentScore < -3) sentimentType = 'negative';
    
    // Update the state with sentiment information
    const updatedState = {
      ...state,
      sentiment: {
        overall: sentimentType,
        score: sentimentScore,
        details: sentimentAnalysis.summary || '',
        fullAnalysis: sentimentAnalysis
      }
    };

    // Send a message about the sentiment assessment
    const satisfaction = sentimentAnalysis.satisfactionPrediction || 'unknown';
    const keyEmotions = sentimentAnalysis.keyEmotions?.join(', ') || 'No key emotions detected';
    
    const message = {
      id: uuidv4(),
      from: 'sentiment',
      to: 'all',
      content: `Sentiment analysis: ${sentimentType} (${sentimentScore}/10). Member satisfaction: ${satisfaction}/10. Key emotions: ${keyEmotions}.`,
      timestamp: Date.now()
    };

    return {
      ...updatedState,
      messages: [...updatedState.messages, message]
    };
  }
}
