
export type AgentType = 
  | 'routing'
  | 'authorization'
  | 'claims'
  | 'general'
  | 'urgency'
  | 'sentiment'
  | 'medical'
  | 'soap_generator'
  | 'clinical_evaluator'
  | 'completeness_evaluator'
  | 'actionability_evaluator';

export type CallDisposition =
  | 'authorization'
  | 'claims_inquiry'
  | 'benefits'
  | 'grievance'
  | 'enrollment'
  | 'general';

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType | 'all';
  content: string;
  timestamp: number;
}

export interface AgentState {
  transcript: string;
  disposition?: CallDisposition;
  extractedInfo: Record<string, any>;
  urgency?: {
    level: number;
    reason: string;
  };
  sentiment?: {
    overall: SentimentType;
    score: number;
    details: string;
  };
  medicalInfo?: {
    conditions: string[];
    procedures: string[];
    symptoms: string[];
    timeline: string;
  };
  soapNote?: SOAPNote;
  evaluationResults?: EvaluationResults;
  messages: AgentMessage[];
}

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface EvaluationMetric {
  score: number;
  details: string;
}

export interface EvaluationDimension {
  score: number;
  metrics: Record<string, EvaluationMetric>;
}

export interface EvaluationResults {
  multiAgent: {
    completeness: EvaluationDimension;
    accuracy: EvaluationDimension;
    clinicalRelevance: EvaluationDimension;
    actionability: EvaluationDimension;
    overallQuality: number;
  };
  sequential: {
    completeness: EvaluationDimension;
    accuracy: EvaluationDimension;
    clinicalRelevance: EvaluationDimension;
    actionability: EvaluationDimension;
    overallQuality: number;
  };
}
