
import React from 'react';

const SystemArchitecture: React.FC = () => {
  return (
    <div className="flex flex-col items-center mx-auto max-w-5xl">
      <svg className="w-full" viewBox="0 0 1000 650" xmlns="http://www.w3.org/2000/svg">
        {/* Background */}
        <rect x="0" y="0" width="1000" height="650" fill="#f8fafc" rx="10" ry="10" />
        
        {/* Title and Subtitle */}
        <text x="500" y="40" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1e293b">Multi-Agent Healthcare Call Processing System</text>
        <text x="500" y="70" textAnchor="middle" fontSize="16" fill="#64748b">Collaborative AI Agents for Enhanced SOAP Note Generation</text>
        
        {/* Input */}
        <rect x="420" y="100" width="160" height="60" rx="8" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2" />
        <text x="500" y="135" textAnchor="middle" fontSize="16" fill="#0c4a6e">Transcript Input</text>
        
        {/* Routing Agent */}
        <rect x="420" y="200" width="160" height="60" rx="8" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
        <text x="500" y="230" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e40af">Routing Agent</text>
        <text x="500" y="250" textAnchor="middle" fontSize="12" fill="#1e40af">Call Classification</text>
        
        {/* Arrow from Input to Routing */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>
        <line x1="500" y1="160" x2="500" y2="200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Branches */}
        <line x1="500" y1="260" x2="500" y2="290" stroke="#64748b" strokeWidth="2" />
        <line x1="500" y1="290" x2="200" y2="290" stroke="#64748b" strokeWidth="2" />
        <line x1="500" y1="290" x2="800" y2="290" stroke="#64748b" strokeWidth="2" />
        <line x1="200" y1="290" x2="200" y2="320" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="500" y1="290" x2="500" y2="320" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="800" y1="290" x2="800" y2="320" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Specialist Agents */}
        <rect x="120" y="320" width="160" height="60" rx="8" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="200" y="350" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#4338ca">Authorization Agent</text>
        <text x="200" y="370" textAnchor="middle" fontSize="12" fill="#4338ca">Insurance Approvals</text>
        
        <rect x="420" y="320" width="160" height="60" rx="8" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="500" y="350" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#4338ca">Claims Agent</text>
        <text x="500" y="370" textAnchor="middle" fontSize="12" fill="#4338ca">Billing Processing</text>
        
        <rect x="720" y="320" width="160" height="60" rx="8" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="800" y="350" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#4338ca">General Agent</text>
        <text x="800" y="370" textAnchor="middle" fontSize="12" fill="#4338ca">Other Inquiries</text>
        
        {/* Combine flows */}
        <line x1="200" y1="380" x2="200" y2="410" stroke="#64748b" strokeWidth="2" />
        <line x1="500" y1="380" x2="500" y2="410" stroke="#64748b" strokeWidth="2" />
        <line x1="800" y1="380" x2="800" y2="410" stroke="#64748b" strokeWidth="2" />
        <line x1="200" y1="410" x2="500" y2="410" stroke="#64748b" strokeWidth="2" />
        <line x1="800" y1="410" x2="500" y2="410" stroke="#64748b" strokeWidth="2" />
        <line x1="500" y1="410" x2="500" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Analysis Engines - Row 1 */}
        <rect x="100" y="440" width="200" height="60" rx="8" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="200" y="470" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#5b21b6">Urgency Analysis</text>
        <text x="200" y="490" textAnchor="middle" fontSize="12" fill="#5b21b6">Priority Assessment</text>
        
        <rect x="320" y="440" width="200" height="60" rx="8" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="420" y="470" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#5b21b6">Sentiment Analysis</text>
        <text x="420" y="490" textAnchor="middle" fontSize="12" fill="#5b21b6">Emotional Content</text>
        
        {/* Analysis Engines - Row 2 */}
        <rect x="540" y="440" width="200" height="60" rx="8" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="640" y="470" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#5b21b6">Medical Info Extractor</text>
        <text x="640" y="490" textAnchor="middle" fontSize="12" fill="#5b21b6">Key Clinical Data</text>
        
        <rect x="760" y="440" width="200" height="60" rx="8" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="860" y="470" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#5b21b6">SOAP Note Generator</text>
        <text x="860" y="490" textAnchor="middle" fontSize="12" fill="#5b21b6">Documentation</text>
        
        {/* Arrows to Analysis Engines */}
        <line x1="500" y1="440" x2="200" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="500" y1="440" x2="420" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="500" y1="440" x2="640" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="500" y1="440" x2="860" y2="440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Combine analysis results */}
        <line x1="200" y1="500" x2="200" y2="530" stroke="#64748b" strokeWidth="2" />
        <line x1="420" y1="500" x2="420" y2="530" stroke="#64748b" strokeWidth="2" />
        <line x1="640" y1="500" x2="640" y2="530" stroke="#64748b" strokeWidth="2" />
        <line x1="860" y1="500" x2="860" y2="530" stroke="#64748b" strokeWidth="2" />
        <line x1="200" y1="530" x2="860" y2="530" stroke="#64748b" strokeWidth="2" />
        <line x1="500" y1="530" x2="500" y2="560" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Evaluators */}
        <rect x="200" y="560" width="200" height="60" rx="8" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
        <text x="300" y="590" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#be185d">Clinical Accuracy</text>
        <text x="300" y="610" textAnchor="middle" fontSize="12" fill="#be185d">Evaluator Agent</text>
        
        <rect x="420" y="560" width="160" height="60" rx="8" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
        <text x="500" y="590" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#be185d">Completeness</text>
        <text x="500" y="610" textAnchor="middle" fontSize="12" fill="#be185d">Evaluator Agent</text>
        
        <rect x="600" y="560" width="200" height="60" rx="8" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
        <text x="700" y="590" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#be185d">Actionability</text>
        <text x="700" y="610" textAnchor="middle" fontSize="12" fill="#be185d">Evaluator Agent</text>
        
        {/* Connect to evaluators */}
        <line x1="300" y1="530" x2="300" y2="560" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="500" y1="530" x2="500" y2="560" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <line x1="700" y1="530" x2="700" y2="560" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" />
        
        {/* Legend */}
        <rect x="850" y="560" width="20" height="20" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="2" />
        <text x="875" y="575" fontSize="14" fill="#334155" dominantBaseline="middle">Routing</text>
        
        <rect x="850" y="585" width="20" height="20" fill="#c7d2fe" stroke="#6366f1" strokeWidth="2" />
        <text x="875" y="600" fontSize="14" fill="#334155" dominantBaseline="middle">Specialist Agents</text>
        
        <rect x="850" y="610" width="20" height="20" fill="#ddd6fe" stroke="#8b5cf6" strokeWidth="2" />
        <text x="875" y="625" fontSize="14" fill="#334155" dominantBaseline="middle">Analysis Engines</text>
        
        <rect x="850" y="635" width="20" height="20" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
        <text x="875" y="650" fontSize="14" fill="#334155" dominantBaseline="middle">Evaluators</text>
      </svg>
      
      <div className="mt-8 text-sm text-gray-500 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">System Flow Process:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Transcript is submitted to the system</li>
              <li>Routing Agent analyzes and classifies the call type</li>
              <li>Appropriate Specialist Agent processes the transcript</li>
              <li>Analysis Engines extract key information in parallel:</li>
              <ul className="list-disc pl-5 mt-1 mb-1">
                <li>Urgency Analysis determines priority level</li>
                <li>Sentiment Analysis evaluates emotional context</li>
                <li>Medical Information Extractor identifies clinical data</li>
                <li>SOAP Note Generator creates structured documentation</li>
              </ul>
              <li>Evaluators assess quality across multiple dimensions</li>
              <li>Final output delivered with evaluation metrics</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Key System Advantages:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-semibold">Dynamic Routing:</span> Intelligent content classification</li>
              <li><span className="font-semibold">Specialized Processing:</span> Domain-specific agents for different call types</li>
              <li><span className="font-semibold">Parallel Analysis:</span> Simultaneous information extraction</li>
              <li><span className="font-semibold">Multi-dimensional Evaluation:</span> Quality assessment from different perspectives</li>
              <li><span className="font-semibold">Comprehensive Documentation:</span> Complete SOAP notes with relevant clinical context</li>
              <li><span className="font-semibold">Quality Assurance:</span> Built-in evaluation measures accuracy, completeness and actionability</li>
              <li><span className="font-semibold">Adaptive Learning:</span> System improves over time through feedback loops</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;
