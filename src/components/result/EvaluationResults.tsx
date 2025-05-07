
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvaluationResults } from '@/types/agent';
import { BarChart, BarChart2 } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';

interface EvaluationResultsDisplayProps {
  results: EvaluationResults;
}

const EvaluationResultsDisplay: React.FC<EvaluationResultsDisplayProps> = ({ results }) => {
  // Format data for the chart
  const chartData = [
    {
      name: 'Completeness',
      multiAgent: results.multiAgent.completeness.score,
      sequential: results.sequential.completeness.score,
    },
    {
      name: 'Accuracy',
      multiAgent: results.multiAgent.accuracy.score,
      sequential: results.sequential.accuracy.score,
    },
    {
      name: 'Actionability',
      multiAgent: results.multiAgent.actionability.score,
      sequential: results.sequential.actionability.score,
    },
    {
      name: 'Overall',
      multiAgent: results.multiAgent.overallQuality,
      sequential: results.sequential.overallQuality,
    },
  ];
  
  const improvementData = chartData.map(item => ({
    name: item.name,
    improvement: ((item.multiAgent - item.sequential) / item.sequential * 100).toFixed(0),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Evaluation Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quality Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Bar 
                name="Multi-Agent System" 
                dataKey="multiAgent" 
                fill="#8B5CF6" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="multiAgent" position="top" formatter={(value: number) => value.toFixed(1)} />
              </Bar>
              <Bar 
                name="Sequential Pipeline" 
                dataKey="sequential" 
                fill="#60A5FA" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="sequential" position="top" formatter={(value: number) => value.toFixed(1)} />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Improvement Percentage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart
              data={improvementData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip formatter={(value) => [`${value}%`, 'Improvement']} />
              <Bar 
                name="Improvement %" 
                dataKey="improvement" 
                fill="#22C55E" 
                radius={[4, 4, 0, 0]}
              >
                <LabelList dataKey="improvement" position="top" formatter={(value: string) => `${value}%`} />
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Multi-Agent System Results</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-medium">Completeness:</span> {results.multiAgent.completeness.score.toFixed(1)}/10</li>
              <li><span className="font-medium">Accuracy:</span> {results.multiAgent.accuracy.score.toFixed(1)}/10</li>
              <li><span className="font-medium">Actionability:</span> {results.multiAgent.actionability.score.toFixed(1)}/10</li>
              <li><span className="font-medium">Overall Quality:</span> {results.multiAgent.overallQuality.toFixed(1)}/10</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Sequential Pipeline Results</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="font-medium">Completeness:</span> {results.sequential.completeness.score.toFixed(1)}/10</li>
              <li><span className="font-medium">Accuracy:</span> {results.sequential.accuracy.score.toFixed(1)}/10</li>
              <li><span className="font-medium">Actionability:</span> {results.sequential.actionability.score.toFixed(1)}/10</li>
              <li><span className="font-medium">Overall Quality:</span> {results.sequential.overallQuality.toFixed(1)}/10</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationResultsDisplay;
