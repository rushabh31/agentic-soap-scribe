
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
  | 'actionability_evaluator'
  | 'evaluation';

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
    medications?: any[];
    medicalHistory?: string;
    timeline?: string;
    providers?: any[];
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
  strengths?: string[];
  weaknesses?: string[];
  analysis?: string;
}

// Updated to match the implementation in evaluator files
export interface EvaluationResults {
  clinicalAccuracy?: EvaluationDimension;
  completeness?: EvaluationDimension;
  actionability?: EvaluationDimension;
  overallScore: number;
  summary?: string;
  recommendations?: string[];
  error?: string;
  rawResponse?: string;
  
  // Added for compatibility with clinical and actionability evaluators
  multiAgent?: {
    soapNote?: SOAPNote;
    completeness?: EvaluationDimension;
    accuracy?: EvaluationDimension;
    clinicalRelevance?: EvaluationDimension;
    actionability?: EvaluationDimension;
    overallQuality?: number;
  };
  sequential?: {
    soapNote?: SOAPNote;
    completeness?: EvaluationDimension;
    accuracy?: EvaluationDimension;
    clinicalRelevance?: EvaluationDimension;
    actionability?: EvaluationDimension;
    overallQuality?: number;
  };
}
