
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SystemArchitecture from '@/components/SystemArchitecture';
import OldSystemArchitecture from '@/components/OldSystemArchitecture';
import { ActivitySquare, Clock, Network, FileBarChart, Code } from 'lucide-react';

const SystemArchitecturePage = () => {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">System Architecture</h1>
        <p className="text-gray-600 mb-6">
          Visual and textual representation of the SOAP note generation system architectures.
        </p>
        
        <Tabs defaultValue="current" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Current Multi-Agent System
            </TabsTrigger>
            <TabsTrigger value="old" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Legacy Pipeline Architecture
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Multi-Agent System Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemArchitecture />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileBarChart className="h-5 w-5" />
                      Key Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-md font-semibold mb-1">Dynamic Routing</h3>
                      <p className="text-sm text-gray-600">
                        Intelligently routes transcripts to specialized agents based on content type and requirements.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Parallel Processing</h3>
                      <p className="text-sm text-gray-600">
                        Multiple analysis engines work simultaneously to extract different types of information.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Expert Evaluation</h3>
                      <p className="text-sm text-gray-600">
                        Dedicated evaluator agents assess output quality across multiple dimensions.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Collaborative Intelligence</h3>
                      <p className="text-sm text-gray-600">
                        Agents share information and build upon each other's outputs to create comprehensive documentation.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Adaptive Learning</h3>
                      <p className="text-sm text-gray-600">
                        System learns from evaluation feedback to continuously improve output quality.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="old">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Legacy Pipeline Architecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <OldSystemArchitecture />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Pipeline Characteristics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-md font-semibold mb-1">Sequential Processing</h3>
                      <p className="text-sm text-gray-600">
                        Each stage processes output from the previous stage in a predetermined order.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Fixed Disposition Categories</h3>
                      <p className="text-sm text-gray-600">
                        Limited to 18 predefined call disposition categories determined by experts.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Single Model Approach</h3>
                      <p className="text-sm text-gray-600">
                        Uses the same model for multiple stages with different prompts rather than specialized agents.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Basic Sentiment Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Simple satisfied/neutral/dissatisfied classification without detailed insights.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-md font-semibold mb-1">Static Template Structure</h3>
                      <p className="text-sm text-gray-600">
                        Fixed SOAP template structure with limited adaptability to different call types.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SystemArchitecturePage;
