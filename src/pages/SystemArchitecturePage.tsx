
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SystemArchitecture from '@/components/SystemArchitecture';
import OldSystemArchitecture from '@/components/OldSystemArchitecture';
import { ActivitySquare, Clock } from 'lucide-react';

const SystemArchitecturePage = () => {
  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">System Architecture</h1>
        <p className="text-gray-600 mb-6">
          Visual and textual representation of the SOAP note generation system architectures.
        </p>
        
        <Tabs defaultValue="current" className="mb-6">
          <TabsList>
            <TabsTrigger value="current">Current Architecture</TabsTrigger>
            <TabsTrigger value="old">Legacy Architecture</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ActivitySquare className="h-5 w-5" />
                  Current Multi-Agent System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemArchitecture />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="old">
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
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default SystemArchitecturePage;
