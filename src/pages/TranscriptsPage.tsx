
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import TranscriptForm from '@/components/TranscriptForm';
import ProcessingProgress from '@/components/ProcessingProgress';
import { useAgent } from '@/contexts/AgentContext';
import ApiKeyForm from '@/components/ApiKeyForm';
import ModelSelector from '@/components/ModelSelector';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Settings } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const TranscriptsPage = () => {
  const { isProcessing, hasApiConfig } = useAgent();
  const { apiProvider, isOllamaConnected } = useSettings();
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Process Transcript
        </h1>
        <p className="text-gray-600 mb-6">
          Submit a healthcare call transcript to be processed by the multi-agent system.
        </p>
        
        <Tabs defaultValue="transcript" className="mb-6">
          <TabsList>
            <TabsTrigger value="transcript">Submit Transcript</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transcript">
            {isProcessing ? (
              <ProcessingProgress />
            ) : (
              <TranscriptForm />
            )}
            
            <div className="mt-8">
              <Separator className="my-6" />
              <h2 className="text-xl font-semibold mb-4">Sample Transcript</h2>
              <div className="bg-gray-50 p-4 rounded-md border text-sm">
                <pre className="whitespace-pre-wrap">
{`AGENT: Thank you for calling HealthFirst Insurance. My name is Jamie. May I have your member ID and date of birth to verify your account?

MEMBER: Yes, my ID is MH273645 and my date of birth is 5/12/1972.

AGENT: Thank you, Mrs. Rodriguez. I've verified your information. How can I help you today?

MEMBER: I'm calling because my doctor ordered an MRI for my knee, but I just got a letter saying it wasn't approved. I don't understand why. I've been having severe pain for weeks, and my doctor says I need this test.

AGENT: I'm sorry to hear about your knee pain. Let me look into this for you. Do you have the authorization reference number from the letter?

MEMBER: Yes, it's AUTH-23857.

AGENT: Thank you. I'm looking at your case now. I see that the MRI request was submitted last week on June 15th, and our medical review team determined that a prerequisite step was missing. According to our records, our guidelines require physical therapy to be tried for at least 4 weeks before an MRI for knee pain, unless there's a documented acute injury.

MEMBER: But I've been in so much pain! It hurts to even walk. My doctor said it could be a torn meniscus. I don't think physical therapy is going to fix that, and I'm worried about making it worse.

AGENT: I understand your concern, Mrs. Rodriguez. The pain must be very difficult to deal with. In your case, there are a couple of options. Your doctor can submit additional documentation showing why physical therapy wouldn't be appropriate, or they can indicate if there was a specific injury event that would qualify this as an acute injury case.

MEMBER: I fell while hiking about a month ago. I told my doctor about it, but maybe that information wasn't included in the request?

AGENT: That could be the missing information we need. If there was a fall, that would classify as an acute injury, which has different authorization requirements. I recommend contacting your doctor's office to ensure they include the information about your fall in a revised authorization request. They should also include any imaging they may have already done, such as X-rays.

MEMBER: My doctor did do an X-ray two weeks ago. It didn't show a fracture but he said it doesn't rule out soft tissue damage, which is why he ordered the MRI.

AGENT: That's very helpful information. The X-ray results and documentation of the fall should definitely be included in the revised request. Once we receive the updated information from your doctor, we can expedite the review since you're in pain. The typical turnaround time is 3-5 business days, but I'll add a note to your case about the urgency.

MEMBER: How will I know if it's approved? I'm scheduled to see the orthopedic specialist next week, and I was hoping to have the MRI results by then.

AGENT: Once a decision is made, both you and your doctor will receive a notification. If it's approved, you'll get a letter in the mail, but your doctor will be notified electronically, usually within 24 hours of the decision. Given your appointment next week, I suggest following up with your doctor's office in a few days to make sure they've submitted the revised request.

MEMBER: OK, I'll call my doctor today and explain what you told me about including the fall and the X-ray results.

AGENT: That sounds like a good plan. Is there anything else I can help with today? Would you like me to contact your doctor's office for you to explain what additional information is needed?

MEMBER: No, that's ok. I'll call them myself. But I do have one more question - if the MRI is approved, do I need to go somewhere specific to have it done?

AGENT: That's a good question. HealthFirst works with specific in-network imaging centers to ensure you have the lowest out-of-pocket cost. Once the MRI is approved, you or your doctor can call our provider line to find the nearest in-network facility. There's also a provider directory on our website. Would you like me to check the closest facilities to your home address right now?

MEMBER: Yes, please. That would be helpful.

AGENT: Based on the address we have on file, the closest in-network imaging centers are Regional Medical Imaging on Oak Street, about 3 miles from you, and University Hospital's Outpatient Center, which is about 7 miles away. Both are fully covered under your plan with your standard $50 specialist copay.

MEMBER: Great, thank you for checking. I'll talk to my doctor about submitting the additional information right away.

AGENT: You're welcome, Mrs. Rodriguez. I've documented our conversation and added a note about the missing information regarding your fall and the X-ray results. If you have any other questions or if you don't hear back about the authorization within 5 business days, please call us back. Is there anything else I can assist with today?

MEMBER: No, that's all. Thank you for your help.

AGENT: Thank you for calling HealthFirst. I hope your knee feels better soon. Have a good day.`}
                </pre>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  AI Configuration
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure AI provider and API settings for processing transcripts.
                </p>
                <ApiKeyForm />
              </div>
              
              {hasApiConfig && apiProvider === 'ollama' && isOllamaConnected && (
                <>
                  <Separator />
                  <div>
                    <ModelSelector />
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default TranscriptsPage;
