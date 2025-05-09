export type AgentType =
  | 'routing'
  | 'authorization'
  | 'claims'
  | 'general'
  | 'urgency'
  | 'sentiment'
  | 'medical'
  | 'soap_generator'
  | 'evaluation'
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

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType | 'all';
  content: string;
  timestamp: number;
}

export interface EvaluationDimension {
  score: number;
  metrics: Record<string, any>;
}

export interface SystemEvaluation {
  soapNote?: SOAPNote;
  completeness?: EvaluationDimension;
  accuracy?: EvaluationDimension;
  clinicalRelevance?: EvaluationDimension;
  actionability?: EvaluationDimension;
  overallQuality?: number;
}

export interface EvaluationResults {
  overallScore: number;
  summary?: string;
  recommendations?: string[];
  multiAgent: SystemEvaluation;
  sequential: SystemEvaluation;
}

export interface AgentState {
  transcript?: string;
  disposition?: CallDisposition;
  extractedInfo: Record<string, any>;
  urgency?: {
    level: number;
    reason: string;
    details?: any;
  };
  sentiment?: {
    overall: SentimentType;
    score: number;
    details: string;
    fullAnalysis?: any;
  };
  medicalInfo?: {
    conditions: any[];
    procedures: any[];
    symptoms: any[];
    medications: any[];
    medicalHistory: string;
    timeline: string;
    providers: any[];
  };
  soapNote?: SOAPNote;
  evaluationResults?: EvaluationResults;
  messages: AgentMessage[];
}
