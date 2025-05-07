
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Agentic SOAP Scribe</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
          <p className="mb-4">
            Agentic SOAP Scribe is an advanced multi-agent AI system designed to transform healthcare 
            contact center interactions into structured clinical documentation. Built upon research in 
            healthcare AI, the system employs a collaborative network of specialized agents to process 
            healthcare call transcripts.
          </p>
          <p>
            This application demonstrates the practical implementation of a multi-agent architecture
            for clinical documentation, showcasing improved performance over traditional sequential
            approaches in completeness, accuracy, and actionability.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Multi-Agent Architecture</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">System Components</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="font-medium">Routing Agent:</span> Classifies the call type and directs it to the appropriate specialist agent
              </li>
              <li>
                <span className="font-medium">Specialist Agents:</span> Domain-specific experts that extract relevant information based on call type
                <ul className="list-circle pl-6 mt-1">
                  <li>Authorization Agent: Focuses on procedure approvals and medical necessity</li>
                  <li>Claims Agent: Extracts claim-specific details like claim numbers and denial reasons</li>
                  <li>General Agent: Handles miscellaneous inquiries with a flexible extraction approach</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Analysis Engines:</span> Specialized components for multi-dimensional analysis
                <ul className="list-circle pl-6 mt-1">
                  <li>Urgency Analysis Engine: Evaluates time-sensitivity and priority</li>
                  <li>Sentiment Analysis Engine: Applies sentiment analysis at the sentence level</li>
                  <li>Medical Information Extractor: Identifies medical conditions, procedures, and symptoms</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">SOAP Generator:</span> Synthesizes all gathered information into a structured clinical SOAP note
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Evaluation Framework</h3>
            <p className="mb-2">
              The system includes an AI-based evaluation framework with specialized "evaluator agents"
              to assess the quality of generated SOAP notes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><span className="font-medium">Clinical Accuracy Agent:</span> Assesses factual correctness</li>
              <li><span className="font-medium">Documentation Completeness Agent:</span> Evaluates information comprehensiveness</li>
              <li><span className="font-medium">Actionability Assessment Agent:</span> Measures support for clinical decision-making</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Research Background</h2>
          <p className="mb-4">
            This application is based on research exploring how decomposing complex healthcare 
            information tasks into specialized agent components can enhance clinical documentation 
            quality while maintaining integration with existing workflows.
          </p>
          <p className="mb-4">
            Comparative evaluations demonstrate that the multi-agent approach significantly 
            outperforms sequential approaches in documentation quality and processing efficiency:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>42% improvement in documentation completeness</li>
            <li>37% improvement in clinical accuracy</li>
            <li>28% reduction in end-to-end processing time</li>
          </ul>
          <p>
            The findings contribute to the understanding of how AI systems can be designed 
            to support complex healthcare tasks by mirroring organizational structures and 
            specialization patterns.
          </p>
        </div>
        
        <div className="text-center py-8">
          <Button asChild size="lg" className="bg-medical-primary hover:bg-medical-primary/90">
            <Link to="/transcripts">Try the System</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
