
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SOAPNote } from '@/types/agent';
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';

interface SOAPNoteDisplayProps {
  soapNote: SOAPNote;
  title?: string;
}

const SOAPNoteDisplay: React.FC<SOAPNoteDisplayProps> = ({ soapNote, title = 'SOAP Note' }) => {
  const copyToClipboard = () => {
    const content = `
SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}
    `.trim();
    
    navigator.clipboard.writeText(content).then(
      () => toast.success('SOAP note copied to clipboard'),
      () => toast.error('Failed to copy SOAP note')
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <button
          onClick={copyToClipboard}
          className="flex items-center text-sm text-gray-500 hover:text-medical-primary"
          title="Copy to clipboard"
        >
          <ClipboardCopy className="h-4 w-4 mr-1" />
          Copy
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="soap-section">
          <h3 className="font-bold text-lg mb-2">Subjective</h3>
          <div className="whitespace-pre-wrap text-gray-700">{soapNote.subjective}</div>
        </div>
        
        <div className="soap-section">
          <h3 className="font-bold text-lg mb-2">Objective</h3>
          <div className="whitespace-pre-wrap text-gray-700">{soapNote.objective}</div>
        </div>
        
        <div className="soap-section">
          <h3 className="font-bold text-lg mb-2">Assessment</h3>
          <div className="whitespace-pre-wrap text-gray-700">{soapNote.assessment}</div>
        </div>
        
        <div className="soap-section">
          <h3 className="font-bold text-lg mb-2">Plan</h3>
          <div className="whitespace-pre-wrap text-gray-700">{soapNote.plan}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SOAPNoteDisplay;
