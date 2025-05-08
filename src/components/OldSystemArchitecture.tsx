
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const OldSystemArchitecture: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center mx-auto max-w-5xl">
        <svg className="w-full" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
          {/* Background */}
          <rect x="0" y="0" width="1000" height="500" fill="#f8fafc" rx="10" ry="10" />
          
          {/* Title */}
          <text x="500" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b">Legacy Pipeline Architecture</text>
          <text x="500" y="70" textAnchor="middle" fontSize="16" fill="#64748b">Sequential Processing System for Healthcare Call Documentation</text>
          
          {/* Main Pipeline Flow */}
          {/* Pipeline Backbone */}
          <line x1="100" y1="200" x2="900" y2="200" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
          
          {/* Stage nodes */}
          {/* Stage 1 */}
          <circle cx="150" cy="200" r="40" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
          <text x="150" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e40af">Stage 1</text>
          <text x="150" y="215" textAnchor="middle" fontSize="12" fill="#1e40af">Speech-to-Text</text>
          <text x="150" y="275" textAnchor="middle" fontSize="11" fill="#64748b">(Skipped for direct</text>
          <text x="150" y="290" textAnchor="middle" fontSize="11" fill="#64748b">text transcript input)</text>
          
          {/* Stage 2a */}
          <circle cx="350" cy="200" r="40" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
          <text x="350" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#4338ca">Stage 2a</text>
          <text x="350" y="215" textAnchor="middle" fontSize="12" fill="#4338ca">Call Disposition</text>
          <text x="350" y="275" textAnchor="middle" fontSize="11" fill="#64748b">Classifies calls into</text>
          <text x="350" y="290" textAnchor="middle" fontSize="11" fill="#64748b">18 predefined categories</text>
          
          {/* Stage 2b */}
          <circle cx="550" cy="200" r="40" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2" />
          <text x="550" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#5b21b6">Stage 2b</text>
          <text x="550" y="215" textAnchor="middle" fontSize="12" fill="#5b21b6">SOAP Generation</text>
          <text x="550" y="275" textAnchor="middle" fontSize="11" fill="#64748b">LLM creates structured</text>
          <text x="550" y="290" textAnchor="middle" fontSize="11" fill="#64748b">clinical documentation</text>
          
          {/* Stage 3 */}
          <circle cx="750" cy="200" r="40" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
          <text x="750" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#be185d">Stage 3</text>
          <text x="750" y="215" textAnchor="middle" fontSize="12" fill="#be185d">Sentiment Analysis</text>
          <text x="750" y="275" textAnchor="middle" fontSize="11" fill="#64748b">Classifies sentiment as</text>
          <text x="750" y="290" textAnchor="middle" fontSize="11" fill="#64748b">satisfied/neutral/dissatisfied</text>
          
          {/* Output */}
          <rect x="850" cy="150" width="100" height="100" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
          <text x="900" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Output</text>
          <text x="900" y="215" textAnchor="middle" fontSize="12" fill="#334155">SOAP Note</text>
          
          {/* Arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>
          
          <line x1="190" y1="200" x2="310" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="390" y1="200" x2="510" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="590" y1="200" x2="710" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="790" y1="200" x2="850" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />

          {/* Detailed boxes */}
          {/* SOAP Template Structure */}
          <rect x="100" y="350" width="200" height="120" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <text x="200" y="370" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">SOAP Template</text>
          <text x="200" y="395" textAnchor="middle" fontSize="12" fill="#475569">Subjective: Patient reports</text>
          <text x="200" y="415" textAnchor="middle" fontSize="12" fill="#475569">Objective: Factual data</text>
          <text x="200" y="435" textAnchor="middle" fontSize="12" fill="#475569">Assessment: Conclusions</text>
          <text x="200" y="455" textAnchor="middle" fontSize="12" fill="#475569">Plan: Next steps</text>
          
          {/* Call Categories */}
          <rect x="400" y="350" width="200" height="120" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <text x="500" y="370" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Call Categories</text>
          <text x="500" y="395" textAnchor="middle" fontSize="12" fill="#475569">Claims, Authorization, Benefits</text>
          <text x="500" y="415" textAnchor="middle" fontSize="12" fill="#475569">Grievances, LEP, LIS, Transport</text>
          <text x="500" y="435" textAnchor="middle" fontSize="12" fill="#475569">Enrollment, Eligibility, Billing</text>
          <text x="500" y="455" textAnchor="middle" fontSize="12" fill="#475569">and 7 other categories</text>
          
          {/* Sentiment Analysis */}
          <rect x="700" y="350" width="200" height="120" rx="8" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
          <text x="800" y="370" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">Sentiment Scale</text>
          <text x="800" y="395" textAnchor="middle" fontSize="12" fill="#475569">Satisfied: > 0.3</text>
          <text x="800" y="415" textAnchor="middle" fontSize="12" fill="#475569">Neutral: -0.3 to 0.3</text>
          <text x="800" y="435" textAnchor="middle" fontSize="12" fill="#475569">Dissatisfied: < -0.3</text>
          <text x="800" y="455" textAnchor="middle" fontSize="12" fill="#475569">Based on custom healthcare model</text>
          
          {/* Connector lines */}
          <line x1="200" y1="240" x2="200" y2="350" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1="500" y1="240" x2="500" y2="350" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1="800" y1="240" x2="800" y2="350" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1="350" y1="240" x2="350" y2="300" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1="350" y1="300" x2="500" y2="350" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1="550" y1="240" x2="550" y2="300" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
          <line x1="550" y1="300" x2="200" y2="350" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5,3" />
        </svg>
      </div>
      
      <div className="prose prose-sm max-w-none">
        <h3 className="text-xl font-semibold mb-3">Legacy Pipeline Architecture</h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-sm text-blue-700">
            The legacy system follows a sequential pipeline approach, processing healthcare call transcripts 
            through distinct stages to generate structured SOAP notes and sentiment analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mt-4">Stage 1: Speech-to-Text Conversion</h4>
            <p className="text-gray-700 text-sm">
              In the original system, audio recordings are converted to text using advanced ASR technologies 
              that remove background noise and improve transcription accuracy. This step is skipped in our implementation 
              as we directly accept text transcripts.
            </p>
            
            <h4 className="text-lg font-medium mt-4">Stage 2a: Call Disposition Classification</h4>
            <p className="text-gray-700 text-sm">
              The text transcript is analyzed to identify the call disposition from 18 predefined categories 
              defined by Contact Center experts. These categories include claims inquiries, authorization requests,
              benefits explanations, grievances, and more. This classification helps target the documentation
              approach to the specific call type.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium mt-4 md:mt-0">Stage 2b: SOAP Note Generation</h4>
            <p className="text-gray-700 text-sm">
              Using the identified disposition, the system generates structured summaries following the SOAP 
              (Subjective, Objective, Assessment, Plan) format—a standard in healthcare documentation. A custom 
              prompt template specific to the identified disposition ensures relevant information is captured 
              in a consistent structure.
            </p>
            
            <h4 className="text-lg font-medium mt-4">Stage 3: Sentiment Analysis</h4>
            <p className="text-gray-700 text-sm">
              A custom model trained on healthcare-specific survey data analyzes the sentiment of each sentence 
              in the summary. The overall mean sentiment score determines if the call represents a satisfied, 
              neutral, or dissatisfied interaction. This helps identify calls that may require additional review
              or follow-up actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OldSystemArchitecture;
