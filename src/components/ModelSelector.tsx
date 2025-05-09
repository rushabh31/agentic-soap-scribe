
import React from 'react';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

interface ModelSelectorProps {
  provider: string;
  value: string;
  onChange: (model: string) => void;
  isConnected: boolean;
}

export function ModelSelector({ provider, value, onChange, isConnected }: ModelSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Model</div>
        <div className="text-xs text-muted-foreground">Choose a model to use</div>
      </div>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="grid grid-cols-3 gap-2"
        disabled={!isConnected}
      >
        <div>
          <RadioGroupItem value="gpt-3.5-turbo-0125" id="gpt-3.5" className="peer sr-only" />
          <Label
            htmlFor="gpt-3.5"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2 h-5 w-5"
            >
              <circle cx="12" cy="12" r="8" />
              <path d="m12 2-2 4 2-4 2 4-2-4" />
              <path d="m12 22 2-4-2 4-2-4 2 4" />
              <path d="m4.93 4.93 2.83 2.83-2.83-2.83 2.83-2.83-2.83 2.83" />
              <path d="m19.07 19.07-2.83-2.83 2.83 2.83-2.83 2.83 2.83-2.83" />
              <path d="m4.93 19.07 2.83-2.83-2.83 2.83 2.83 2.83-2.83-2.83" />
              <path d="m19.07 4.93-2.83 2.83 2.83-2.83-2.83-2.83 2.83 2.83" />
            </svg>
            <div className="text-xs font-semibold">GPT-3.5</div>
            <div className="text-xs text-muted-foreground">Fast & Affordable</div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="gpt-4-0125-preview" id="gpt-4" className="peer sr-only" />
          <Label
            htmlFor="gpt-4"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2 h-5 w-5"
            >
              <path d="M4 22V2h16v20l-8-8.5-8 8.5Z" />
            </svg>
            <div className="text-xs font-semibold">GPT-4</div>
            <div className="text-xs text-muted-foreground">Powerful & Precise</div>
          </Label>
        </div>
        <div>
          <RadioGroupItem value="claude-3-opus-20240229" id="claude-3" className="peer sr-only" />
          <Label
            htmlFor="claude-3"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mb-2 h-5 w-5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m16 12-4-4-4 4M12 8v8" />
            </svg>
            <div className="text-xs font-semibold">Claude 3</div>
            <div className="text-xs text-muted-foreground">Best for Healthcare</div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
