"use client";

import { useState, useEffect } from "react";
import { Clipboard, Check, Loader2 } from "lucide-react";

interface ResponseTabsProps {
  responses: Record<string, string>;
  selectedModels: string[];
  isLoading: boolean;
}

// Model display names mapping
const MODEL_NAMES: Record<string, string> = {
  "gpt-4": "GPT-4",
  "ux-pilot": "UX Pilot",
  "gemini": "Gemini",
};

export default function ResponseTabs({
  responses,
  selectedModels,
  isLoading,
}: ResponseTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Set first selected model as active tab when models change
  useEffect(() => {
    if (selectedModels.length > 0 && !selectedModels.includes(activeTab || "")) {
      setActiveTab(selectedModels[0]);
    }
  }, [selectedModels, activeTab]);

  const handleCopy = (text: string, model: string) => {
    navigator.clipboard.writeText(text);
    setCopied(model);
    
    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  if (selectedModels.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-gray-500">
        <p>Select at least one AI model to get responses</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200">
        <nav className="flex">
          {selectedModels.map((model) => (
            <button
              key={model}
              onClick={() => setActiveTab(model)}
              className={`relative inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === model
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {MODEL_NAMES[model] || model}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Generating response...</span>
          </div>
        ) : activeTab && responses[activeTab] ? (
          <div className="relative">
            <button
              onClick={() => handleCopy(responses[activeTab], activeTab)}
              className="absolute right-2 top-2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Copy response"
            >
              {copied === activeTab ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Clipboard className="h-5 w-5" />
              )}
            </button>
            <div className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-800">
              {responses[activeTab]}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-gray-500">
            <p>Response will appear here...</p>
          </div>
        )}
      </div>
    </div>
  );
} 