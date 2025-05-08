
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SystemArchitecture: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">System Architecture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mx-auto max-w-4xl">
          <svg className="w-full" viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect x="0" y="0" width="1000" height="650" fill="#f8fafc" rx="10" ry="10" />
            
            {/* Title */}
            <text x="500" y="40" textAnchor="middle" fontSize="24" fontWeight="bold">Healthcare Call Processing System Architecture</text>
            
            {/* Input */}
            <rect x="420" y="70" width="160" height="60" rx="10" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <text x="500" y="105" textAnchor="middle" fontSize="16">Transcript Input</text>
            
            {/* Routing Agent */}
            <rect x="420" y="170" width="160" height="60" rx="5" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2" />
            <text x="500" y="205" textAnchor="middle" fontSize="16">Routing Agent</text>
            
            {/* Arrow from Input to Routing */}
            <line x1="500" y1="130" x2="500" y2="170" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* Branches */}
            <line x1="500" y1="230" x2="500" y2="260" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="260" x2="200" y2="260" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="260" x2="800" y2="260" stroke="#475569" strokeWidth="2" />
            <line x1="200" y1="260" x2="200" y2="290" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="500" y1="260" x2="500" y2="290" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="800" y1="260" x2="800" y2="290" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* Specialist Agents */}
            <rect x="120" y="290" width="160" height="60" rx="5" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
            <text x="200" y="325" textAnchor="middle" fontSize="16">Authorization Agent</text>
            
            <rect x="420" y="290" width="160" height="60" rx="5" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
            <text x="500" y="325" textAnchor="middle" fontSize="16">Claims Agent</text>
            
            <rect x="720" y="290" width="160" height="60" rx="5" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
            <text x="800" y="325" textAnchor="middle" fontSize="16">General Agent</text>
            
            {/* Combine flows */}
            <line x1="200" y1="350" x2="200" y2="380" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="350" x2="500" y2="380" stroke="#475569" strokeWidth="2" />
            <line x1="800" y1="350" x2="800" y2="380" stroke="#475569" strokeWidth="2" />
            <line x1="200" y1="380" x2="500" y2="380" stroke="#475569" strokeWidth="2" />
            <line x1="800" y1="380" x2="500" y2="380" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="380" x2="500" y2="410" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* Analysis Engines */}
            <rect x="100" y="440" width="160" height="60" rx="5" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="180" y="475" textAnchor="middle" fontSize="16">Urgency Analysis</text>
            
            <rect x="300" y="440" width="160" height="60" rx="5" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="380" y="475" textAnchor="middle" fontSize="16">Sentiment Analysis</text>
            
            <rect x="500" y="440" width="160" height="60" rx="5" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="580" y="475" textAnchor="middle" fontSize="16">Medical Info Extractor</text>
            
            <rect x="700" y="440" width="200" height="60" rx="5" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="800" y="475" textAnchor="middle" fontSize="16">SOAP Note Generator</text>
            
            {/* Arrows to Analysis Engines (Parallel) */}
            <line x1="500" y1="410" x2="180" y2="410" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="410" x2="380" y2="410" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="410" x2="580" y2="410" stroke="#475569" strokeWidth="2" />
            <line x1="500" y1="410" x2="800" y2="410" stroke="#475569" strokeWidth="2" />
            <line x1="180" y1="410" x2="180" y2="440" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="380" y1="410" x2="380" y2="440" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="580" y1="410" x2="580" y2="440" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="800" y1="410" x2="800" y2="440" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* Evaluators */}
            <rect x="200" y="550" width="160" height="60" rx="5" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
            <text x="280" y="585" textAnchor="middle" fontSize="16">Clinical Accuracy</text>
            
            <rect x="420" y="550" width="160" height="60" rx="5" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
            <text x="500" y="585" textAnchor="middle" fontSize="16">Completeness</text>
            
            <rect x="640" y="550" width="160" height="60" rx="5" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
            <text x="720" y="585" textAnchor="middle" fontSize="16">Actionability</text>
            
            {/* Combine analysis results */}
            <line x1="180" y1="500" x2="180" y2="520" stroke="#475569" strokeWidth="2" />
            <line x1="380" y1="500" x2="380" y2="520" stroke="#475569" strokeWidth="2" />
            <line x1="580" y1="500" x2="580" y2="520" stroke="#475569" strokeWidth="2" />
            <line x1="800" y1="500" x2="800" y2="520" stroke="#475569" strokeWidth="2" />
            <line x1="180" y1="520" x2="800" y2="520" stroke="#475569" strokeWidth="2" />
            
            {/* Connect to evaluators */}
            <line x1="280" y1="520" x2="280" y2="550" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="500" y1="520" x2="500" y2="550" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="720" y1="520" x2="720" y2="550" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)" />
            
            {/* Arrowhead marker */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
              </marker>
            </defs>
            
            {/* Legend */}
            <rect x="50" y="50" width="20" height="20" fill="#bfdbfe" stroke="#1d4ed8" strokeWidth="2" />
            <text x="80" y="65" fontSize="14" dominantBaseline="middle">Routing</text>
            
            <rect x="50" y="80" width="20" height="20" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
            <text x="80" y="95" fontSize="14" dominantBaseline="middle">Specialist Agents</text>
            
            <rect x="50" y="110" width="20" height="20" fill="#ddd6fe" stroke="#6d28d9" strokeWidth="2" />
            <text x="80" y="125" fontSize="14" dominantBaseline="middle">Analysis Engines</text>
            
            <rect x="50" y="140" width="20" height="20" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" />
            <text x="80" y="155" fontSize="14" dominantBaseline="middle">Evaluators</text>
          </svg>
          
          <div className="mt-8 text-sm text-gray-500 max-w-3xl">
            <p className="mb-2"><strong>System Flow:</strong></p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Transcript is submitted to the system</li>
              <li>Routing Agent classifies the call type and routes to the appropriate specialist agent</li>
              <li>Specialist Agent (Authorization, Claims, or General) processes the transcript</li>
              <li>Analysis Engines work in parallel to extract urgency, sentiment, and medical information</li>
              <li>SOAP Note Generator creates a structured clinical documentation</li>
              <li>Evaluators assess the output for clinical accuracy, completeness, and actionability</li>
              <li>Final processed output is delivered with evaluation scores</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemArchitecture;
