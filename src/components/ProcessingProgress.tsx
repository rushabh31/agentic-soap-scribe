
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAgent } from '@/contexts/AgentContext';
import { Loader2, Layers, Clock, Sparkles } from 'lucide-react';

const ProcessingProgress = () => {
  const { progress } = useAgent();
  const { step, total } = progress;
  const percentage = Math.round((step / total) * 100);
  
  // Determine current stage
  const stage = getStageFromStep(step);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span className="font-medium">Processing Transcript</span>
        </div>
        
        <Progress value={percentage} className="h-2 mb-4" />
        
        <div className="text-sm text-gray-500 mb-6">
          Step {step} of {total} ({percentage}% complete)
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              step >= 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Multi-Agent Processing</div>
              <div className="text-sm text-gray-500">
                {step < 1 ? 'Pending...' : step < 7 ? 'In progress...' : 'Complete'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              step >= 8 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Legacy Pipeline Processing</div>
              <div className="text-sm text-gray-500">
                {step < 8 ? 'Pending...' : step < 9 ? 'In progress...' : 'Complete'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
              step >= 9 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
            }`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">Comparing Results</div>
              <div className="text-sm text-gray-500">
                {step < 9 ? 'Pending...' : step < 10 ? 'In progress...' : 'Complete'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to determine current stage from step number
const getStageFromStep = (step: number) => {
  if (step < 1) return 'initializing';
  if (step < 2) return 'routing';
  if (step < 3) return 'specialist';
  if (step < 4) return 'analysis';
  if (step < 5) return 'soap';
  if (step < 8) return 'evaluation';
  if (step < 9) return 'legacy';
  return 'comparison';
};

export default ProcessingProgress;
