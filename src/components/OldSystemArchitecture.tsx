
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OldSystemArchitecture: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mx-auto max-w-4xl">
        <svg className="w-full" viewBox="0 0 1000 400" xmlns="http://www.w3.org/2000/svg">
          {/* Background */}
          <rect x="0" y="0" width="1000" height="400" fill="#f8fafc" rx="10" ry="10" />
          
          {/* Title */}
          <text x="500" y="40" textAnchor="middle" fontSize="24" fontWeight="bold">Legacy Pipeline Architecture</text>
          
          {/* Stage boxes */}
          <rect x="100" y="100" width="160" height="60" rx="10" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
          <text x="180" y="135" textAnchor="middle" fontSize="16">Stage 1: Speech-to-Text</text>
          <text x="180" y="155" textAnchor="middle" fontSize="12" fill="#64748b">(Skipped for text input)</text>
          
          <rect x="350" y="100" width="160" height="60" rx="10" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2" />
          <text x="430" y="135" textAnchor="middle" fontSize="16">Stage 2a: Call Disposition</text>
          <text x="430" y="155" textAnchor="middle" fontSize="12" fill="#1e40af">Mistral 7B v3</text>
          
          <rect x="600" y="100" width="160" height="60" rx="10" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2" />
          <text x="680" y="135" textAnchor="middle" fontSize="16">Stage 2b: SOAP Generation</text>
          <text x="680" y="155" textAnchor="middle" fontSize="12" fill="#1e40af">LLM Summarization</text>
          
          <rect x="850" y="100" width="160" height="60" rx="10" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
          <text x="930" y="135" textAnchor="middle" fontSize="16">Stage 3: Sentiment Analysis</text>
          
          {/* Arrows */}
          <line x1="260" y1="130" x2="350" y2="130" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="510" y1="130" x2="600" y2="130" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="760" y1="130" x2="850" y2="130" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
          
          {/* Detailed boxes */}
          <rect x="100" y="250" width="200" height="100" rx="5" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
          <text x="200" y="275" textAnchor="middle" fontSize="14" fontWeight="bold">Call Disposition Categories</text>
          <text x="200" y="300" textAnchor="middle" fontSize="11">Claims Inquiries, Authorization, Benefits</text>
          <text x="200" y="320" textAnchor="middle" fontSize="11">Grievances, LEP, LIS, Transportation</text>
          <text x="200" y="340" textAnchor="middle" fontSize="11">and 11 other categories</text>
          
          <rect x="350" y="250" width="200" height="100" rx="5" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
          <text x="450" y="275" textAnchor="middle" fontSize="14" fontWeight="bold">SOAP Template</text>
          <text x="450" y="300" textAnchor="middle" fontSize="11">Subjective: Patient-reported info</text>
          <text x="450" y="320" textAnchor="middle" fontSize="11">Objective: Factual observations</text>
          <text x="450" y="340" textAnchor="middle" fontSize="11">Assessment & Plan: Analysis & steps</text>
          
          <rect x="600" y="250" width="200" height="100" rx="5" fill="#dbeafe" stroke="#2563eb" strokeWidth="1" />
          <text x="700" y="275" textAnchor="middle" fontSize="14" fontWeight="bold">Sentiment Analysis</text>
          <text x="700" y="300" textAnchor="middle" fontSize="11">Custom model for healthcare</text>
          <text x="700" y="320" textAnchor="middle" fontSize="11">Classifies as: satisfied, neutral,</text>
          <text x="700" y="340" textAnchor="middle" fontSize="11">or dissatisfied</text>
          
          {/* Dashed connector lines */}
          <line x1="430" y1="160" x2="430" y2="250" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
          <line x1="200" y1="180" x2="200" y2="250" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
          <line x1="680" y1="160" x2="680" y2="250" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
          <line x1="930" y1="160" x2="830" y2="250" stroke="#475569" strokeWidth="1" strokeDasharray="4" />
          
          {/* Arrowhead marker */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
            </marker>
          </defs>
        </svg>
      </div>
      
      <div className="prose max-w-none">
        <h3 className="text-xl font-semibold mb-3">Legacy Pipeline Architecture</h3>
        
        <p className="mb-4">
          The legacy system architecture follows a sequential pipeline approach with the following stages:
        </p>
        
        <h4 className="text-lg font-medium mt-4">Stage 1: Speech-to-Text Conversion</h4>
        <p className="text-gray-700">
          In the first stage, audio recordings of calls are converted into text using state-of-the-art
          speech-to-text models. This step is skipped in our implementation as we directly accept text transcripts.
          In the original system, advanced ASR technologies were employed to remove background noise and improve 
          the accuracy of the transcription.
        </p>
        
        <h4 className="text-lg font-medium mt-4">Stage 2a: Identifying Call Disposition Using LLMs</h4>
        <p className="text-gray-700">
          Once the audio transcription is complete, the text transcript is processed by an LLM
          (originally Mistral 7B v3). This model analyzes the call content and identifies the call disposition
          from a list of 18 predefined call dispositions defined by Contact Center experts. These dispositions
          cover a range of common call types, such as claims inquiries, authorization requests, benefits
          explanations, and grievances.
        </p>
        
        <h4 className="text-lg font-medium mt-4">Stage 2b: Summarization via LLMs</h4>
        <p className="text-gray-700">
          After the call disposition is identified, the text transcript is combined with a custom
          prompt template specific to the identified disposition. This input is used to generate structured
          summaries that capture key information from the call, organized into sections including the
          SOAP (Subjective, Objective, Assessment, Plan) template—a widely recognized format in
          healthcare documentation.
        </p>
        
        <h4 className="text-lg font-medium mt-4">Stage 3: Sentiment Analysis</h4>
        <p className="text-gray-700">
          The third stage involves sentiment analysis using a custom model trained on healthcare-specific
          survey data. The model evaluates each sentence in the summary for sentiment, and the overall
          mean sentiment score is used to determine the polarity of the call, categorizing it as satisfied,
          neutral, or dissatisfied. This analysis provides valuable insights into calls that may require
          further attention due to dissatisfaction or other concerns.
        </p>
      </div>
    </div>
  );
};

export default OldSystemArchitecture;
