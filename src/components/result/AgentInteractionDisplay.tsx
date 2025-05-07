
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentMessage } from '@/types/agent';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface AgentInteractionDisplayProps {
  messages: AgentMessage[];
}

const AgentInteractionDisplay: React.FC<AgentInteractionDisplayProps> = ({ messages }) => {
  const [filter, setFilter] = useState<string>('all');
  
  // Group messages by agent
  const agentGroups = messages.reduce<Record<string, AgentMessage[]>>((acc, message) => {
    const key = message.from;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(message);
    return acc;
  }, {});
  
  // Get unique agent types for tabs
  const agentTypes = ['all', ...Object.keys(agentGroups)];
  
  // Filter messages based on selected tab
  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(message => message.from === filter);
    
  const getAgentDisplayName = (agentType: string): string => {
    const nameMap: Record<string, string> = {
      routing: 'Routing Agent',
      authorization: 'Authorization Agent',
      claims: 'Claims Agent',
      general: 'General Agent',
      urgency: 'Urgency Analysis',
      sentiment: 'Sentiment Analysis',
      medical: 'Medical Extractor',
      soap_generator: 'SOAP Generator',
      clinical_evaluator: 'Clinical Evaluator',
      completeness_evaluator: 'Completeness Evaluator',
      actionability_evaluator: 'Actionability Evaluator',
      all: 'All Agents'
    };
    
    return nameMap[agentType] || agentType;
  };
  
  const getAgentColor = (agentType: string): string => {
    const colorMap: Record<string, string> = {
      routing: 'bg-blue-100 text-blue-800',
      authorization: 'bg-purple-100 text-purple-800',
      claims: 'bg-green-100 text-green-800',
      general: 'bg-gray-100 text-gray-800',
      urgency: 'bg-red-100 text-red-800',
      sentiment: 'bg-yellow-100 text-yellow-800',
      medical: 'bg-teal-100 text-teal-800',
      soap_generator: 'bg-indigo-100 text-indigo-800',
      clinical_evaluator: 'bg-pink-100 text-pink-800',
      completeness_evaluator: 'bg-orange-100 text-orange-800',
      actionability_evaluator: 'bg-lime-100 text-lime-800'
    };
    
    return colorMap[agentType] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Agent Interactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
          <TabsList className="mb-4 flex flex-wrap gap-1">
            {agentTypes.map(agentType => (
              <TabsTrigger 
                key={agentType} 
                value={agentType}
                className={filter === agentType ? getAgentColor(agentType) : ''}
              >
                {getAgentDisplayName(agentType)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={filter} className="space-y-4">
            {filteredMessages.map(message => (
              <div key={message.id} className="border p-4 rounded-lg animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getAgentColor(message.from)}`}>
                    {getAgentDisplayName(message.from)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(message.timestamp, 'HH:mm:ss')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
            
            {filteredMessages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No messages from this agent yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgentInteractionDisplay;
