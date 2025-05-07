
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Beaker, FileText, BarChart, ArrowRight, MessageSquare, Settings } from 'lucide-react';

const Index = () => {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-12 mb-8">
          <h1 className="text-4xl font-bold text-medical-text mb-4">
            Agentic SOAP Scribe
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform healthcare call transcripts into comprehensive SOAP notes using a multi-agent AI system
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-medical-primary hover:bg-medical-primary/90">
              <Link to="/transcripts">Start Processing</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 card-hover">
            <div className="bg-medical-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Beaker className="h-6 w-6 text-medical-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Multi-Agent Architecture</h3>
            <p className="text-gray-600">
              Specialized AI agents collaborate to process different aspects of healthcare transcripts, 
              enhancing accuracy and completeness.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 card-hover">
            <div className="bg-medical-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-medical-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Structured SOAP Notes</h3>
            <p className="text-gray-600">
              Generate comprehensive SOAP notes that follow clinical best practices and provide
              actionable insights for healthcare professionals.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 card-hover">
            <div className="bg-medical-secondary w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <BarChart className="h-6 w-6 text-medical-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Quality Evaluation</h3>
            <p className="text-gray-600">
              Automatically evaluate and compare documentation quality between multi-agent
              and traditional sequential approaches.
            </p>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-medical-secondary w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-medical-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Submit Healthcare Transcript</h3>
                <p className="text-gray-600">
                  Upload or paste a healthcare call transcript for processing by the multi-agent system.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-medical-secondary w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-medical-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI Multi-Agent Processing</h3>
                <p className="text-gray-600">
                  Specialized agents collaborate to analyze the transcript, extract information, and generate a comprehensive SOAP note.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center p-2 bg-blue-50 rounded-md text-xs">
                    Routing Agent
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-md text-xs">
                    Specialist Agents
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-md text-xs">
                    Analysis Engines
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-medical-secondary w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-semibold text-medical-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Review Results</h3>
                <p className="text-gray-600">
                  View the generated SOAP note, agent interactions, and quality evaluation comparing the multi-agent system to traditional methods.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center py-8 mb-4">
          <Button asChild size="lg" className="bg-medical-primary hover:bg-medical-primary/90">
            <Link to="/transcripts" className="flex items-center gap-2">
              Start Processing <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
