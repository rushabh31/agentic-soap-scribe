
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
  | 'benefits_explanation'
  | 'grievance'
  | 'enrollment'
  | 'provider_issue'
  | 'pharmacy'
  | 'referral'
  | 'eligibility'
  | 'appeals'
  | 'wellness_program'
  | 'care_management'
  | 'coverage_verification'
  | 'billing'
  | 'member_services'
  | 'technical_support'
  | 'appointment_scheduling'
  | 'other'
  | 'benefits'  // Adding missing value
  | 'general';  // Adding missing value

export type SentimentType = 'satisfied' | 'neutral' | 'dissatisfied' | 'positive' | 'negative';

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
  strengths?: string[];
  weaknesses?: string[];
  analysis?: string;
  omissions?: string[];
  comments: string; // Making comments required to match the expected interface
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
  winner?: 'multiagent' | 'legacy' | 'tie';
  reasoning?: string;
}

// Define a proper MedicalInfo interface
export interface MedicalInfo {
  conditions?: string[];
  procedures?: string[];
  symptoms?: string[];
  medications?: string[];
  medicalHistory?: string;
  timeline?: string;
  providers?: string[];
  timelines?: Record<string, string>;
}

export interface ProcessingProgress {
  step: number;
  total: number;
  currentAgent?: string;
  agentInput?: string;
  agentOutput?: string;
}

export interface AgentState {
  transcript?: string;
  disposition?: CallDisposition;
  confidence?: number;
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
  medicalInfo?: MedicalInfo;
  soapNote?: SOAPNote;
  evaluationResults?: EvaluationResults;
  messages: AgentMessage[];
}

// Healthcare Contact Center specific types
export interface UrgencyResult {
  level: number;
  rationale: string;
}

export interface TopicResult {
  topics: string[];
  confidences: number[];
}

export interface DocumentationResult {
  transcript: string;
  disposition: string;
  summary: SOAPNote;
  sentiment: {
    sentiment: SentimentType;
    score: number;
  };
  topics: TopicResult;
}
