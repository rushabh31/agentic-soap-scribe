
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComparisonResult } from '@/contexts/AgentContext';
import { BarChart2, Award, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

interface EvaluationResultsDisplayProps {
  results: ComparisonResult;
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
    improvement: ((item.multiAgent - item.sequential) / item.sequential * 100).toFixed(1),
  }));

  const radarData = [
    {
      category: 'Completeness',
      multiAgent: results.multiAgent.completeness.score,
      sequential: results.sequential.completeness.score,
    },
    {
      category: 'Accuracy',
      multiAgent: results.multiAgent.accuracy.score,
      sequential: results.sequential.accuracy.score,
    },
    {
      category: 'Actionability',
      multiAgent: results.multiAgent.actionability.score,
      sequential: results.sequential.actionability.score,
    },
  ];

  const winnerColor = 
    results.winner === 'multiagent' ? 'bg-purple-100 border-purple-200 text-purple-800' :
    results.winner === 'legacy' ? 'bg-blue-100 border-blue-200 text-blue-800' :
    'bg-gray-100 border-gray-200 text-gray-800';

  return (
    <Card className="w-full shadow-lg border border-gray-200">
      <CardHeader className="bg-gray-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart2 className="h-6 w-6 text-purple-600" />
          SOAP Note Quality Evaluation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[300px]">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Award className="h-5 w-5 text-amber-500 mr-2" />
              Quality Assessment
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                  }}
                />
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
          
          <div className="flex-1 min-w-[300px]">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              Performance Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                <Radar
                  name="Multi-Agent System"
                  dataKey="multiAgent"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Sequential Pipeline"
                  dataKey="sequential"
                  stroke="#60A5FA"
                  fill="#60A5FA"
                  fillOpacity={0.5}
                />
                <Legend />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {improvementData.slice(0, 3).map((item, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 mb-1">{item.name} Difference</h3>
              <div className={`text-2xl font-bold mb-1 ${
                parseFloat(item.improvement) > 0 
                  ? 'text-green-600' 
                  : parseFloat(item.improvement) < 0 
                    ? 'text-red-600' 
                    : 'text-gray-600'
              }`}>
                {parseFloat(item.improvement) > 0 ? '+' : ''}{item.improvement}%
              </div>
              <p className="text-xs text-gray-500">
                {parseFloat(item.improvement) > 0 
                  ? 'Multi-agent system performed better' 
                  : parseFloat(item.improvement) < 0 
                    ? 'Legacy system performed better'
                    : 'Equal performance'}
              </p>
            </div>
          ))}
        </div>
        
        <div className={`p-6 rounded-xl border ${winnerColor} mt-4`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-white/60 shadow-sm ${
              results.winner === 'multiagent' 
                ? 'text-purple-700' 
                : results.winner === 'legacy' 
                  ? 'text-blue-700'
                  : 'text-gray-700'
            }`}>
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {results.winner === 'multiagent' 
                  ? 'Multi-Agent System Wins' 
                  : results.winner === 'legacy' 
                    ? 'Legacy System Wins'
                    : 'It\'s a Tie'}
              </h3>
              <p className="text-sm opacity-80">
                {results.winner === 'multiagent' 
                  ? 'The collaborative agent approach produced better results'
                  : results.winner === 'legacy'
                    ? 'The sequential pipeline approach produced better results'
                    : 'Both systems performed equally well'}
              </p>
            </div>
          </div>
          
          <p className="text-sm whitespace-pre-wrap">{results.reasoning}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border rounded-lg p-4 shadow-sm bg-white">
              <h3 className="font-semibold mb-2 text-purple-700">Multi-Agent System</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completeness:</span>
                  <span className="font-medium">{results.multiAgent.completeness.score.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{results.multiAgent.accuracy.score.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actionability:</span>
                  <span className="font-medium">{results.multiAgent.actionability.score.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                  <span>Overall:</span>
                  <span>{results.multiAgent.overallQuality.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 shadow-sm bg-white">
              <h3 className="font-semibold mb-2 text-blue-700">Legacy Pipeline</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completeness:</span>
                  <span className="font-medium">{results.sequential.completeness.score.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium">{results.sequential.accuracy.score.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actionability:</span>
                  <span className="font-medium">{results.sequential.actionability.score.toFixed(1)}/10</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1 border-t">
                  <span>Overall:</span>
                  <span>{results.sequential.overallQuality.toFixed(1)}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-purple-700">Multi-Agent Detailed Evaluation</h3>
            
            <div className="space-y-3">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="text-sm font-medium text-purple-800">Completeness</h4>
                <p className="text-xs mt-1 text-gray-600">{results.multiAgent.completeness.comments}</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="text-sm font-medium text-purple-800">Accuracy</h4>
                <p className="text-xs mt-1 text-gray-600">{results.multiAgent.accuracy.comments}</p>
              </div>
              
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h4 className="text-sm font-medium text-purple-800">Actionability</h4>
                <p className="text-xs mt-1 text-gray-600">{results.multiAgent.actionability.comments}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold text-blue-700">Legacy System Detailed Evaluation</h3>
            
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800">Completeness</h4>
                <p className="text-xs mt-1 text-gray-600">{results.sequential.completeness.comments}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800">Accuracy</h4>
                <p className="text-xs mt-1 text-gray-600">{results.sequential.accuracy.comments}</p>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-800">Actionability</h4>
                <p className="text-xs mt-1 text-gray-600">{results.sequential.actionability.comments}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationResultsDisplay;
