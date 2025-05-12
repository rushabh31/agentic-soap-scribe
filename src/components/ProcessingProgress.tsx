
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useAgent } from '@/contexts/AgentContext';

const ProcessingProgress: React.FC = () => {
  const { isProcessing, progress } = useAgent();
  
  if (!isProcessing) return null;
  
  const progressPercentage = Math.round((progress.step / progress.total) * 100);
  
  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Routing call to appropriate specialist...';
      case 2: return 'Extracting call-specific information...';
      case 3: return 'Analyzing urgency, sentiment, and medical details...';
      case 4: return 'Generating SOAP note...';
      case 5: return 'Evaluating clinical accuracy...';
      case 6: return 'Evaluating documentation completeness...';
      case 7: return 'Evaluating actionability...';
      default: return 'Processing...';
    }
  };
  
  return (
    <div className="my-8 p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Processing Transcript</h3>
      <div className="space-y-4">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {progress.step} of {progress.total}</span>
          <span>{progressPercentage}% complete</span>
        </div>
        <div className="text-center animate-pulse text-medical-primary font-medium">
          {getStepDescription(progress.step)}
        </div>
      </div>
    </div>
  );
};

export default ProcessingProgress;
