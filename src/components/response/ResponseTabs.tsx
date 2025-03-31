"use client";

import { useState, useEffect } from "react";
import { Clipboard, Check, Loader2 } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

interface ResponseTabsProps {
  responses: Record<string, string>;
  selectedModels: string[];
  isLoading: boolean;
  responseTimes?: Record<string, number>;
  progressStatus?: Record<string, number>;
}

// Model display names mapping
const MODEL_NAMES: Record<string, string> = {
  // OpenAI
  "gpt-4": "GPT-4",
  "gpt-4o": "GPT-4o",
  "gpt-4-turbo": "GPT-4 Turbo",
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  
  // Anthropic
  "claude-3-opus-20240229": "Claude 3 Opus",
  "claude-3-sonnet-20240229": "Claude 3 Sonnet",
  "claude-3-haiku-20240307": "Claude 3 Haiku",
  
  // Gemini
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "gemini-pro": "Gemini Pro",
  
  // Other
  "deepseek-coder": "DeepSeek Coder",
  "sonar-small-online": "Perplexity Sonar",
};

export default function ResponseTabs({
  responses,
  selectedModels,
  isLoading,
  responseTimes = {},
  progressStatus = {},
}: ResponseTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Debug responses
  useEffect(() => {
    console.log("Response tabs received responses:", responses);
    console.log("Selected models:", selectedModels);
    console.log("Active tab:", activeTab);
  }, [responses, selectedModels, activeTab]);

  // Set first selected model as active tab when models change
  useEffect(() => {
    if (selectedModels.length > 0 && (!activeTab || !selectedModels.includes(activeTab))) {
      setActiveTab(selectedModels[0]);
      console.log("Setting active tab to:", selectedModels[0]);
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

  // Determine if we have a valid response for the active tab
  const hasResponse = activeTab && responses && Object.keys(responses).includes(activeTab);
  const responseText = hasResponse ? responses[activeTab!] : "";
  const isError = responseText?.startsWith("Error:");
  const responseTime = activeTab ? responseTimes[activeTab] || 0 : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200">
        <nav className="flex">
          {selectedModels.map((model) => {
            const hasModelResponse = responses && responses[model];
            const isModelError = hasModelResponse && responses[model].startsWith("Error:");
            const progress = progressStatus[model] || 0;
            
            return (
              <button
                key={model}
                onClick={() => setActiveTab(model)}
                className={`group relative inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === model
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } ${isModelError ? "text-red-500" : ""}`}
              >
                {MODEL_NAMES[model] || model}
                
                {/* Status indicators */}
                {isLoading && !hasModelResponse && (
                  <div className="relative ml-2">
                    {progress > 0 ? (
                      <div className="h-2 w-2 overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className="h-full bg-indigo-500" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="h-2 w-2 animate-pulse rounded-full bg-indigo-300"></div>
                    )}
                  </div>
                )}
                
                {hasModelResponse && !isLoading && (
                  <span className={`ml-2 h-2 w-2 rounded-full ${isModelError ? "bg-red-500" : "bg-green-500"}`}></span>
                )}
                
                {/* Tooltip with response time */}
                {hasModelResponse && responseTimes[model] && (
                  <div className="invisible absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:visible">
                    {(responseTimes[model] / 1000).toFixed(1)}s
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading && !hasResponse ? (
          <div className="flex h-full flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="mt-2 text-gray-600">Generating response...</span>
            {activeTab && progressStatus[activeTab] > 0 && (
              <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-gray-200">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${progressStatus[activeTab]}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : hasResponse ? (
          <div className="relative">
            <button
              onClick={() => handleCopy(responseText, activeTab!)}
              className="absolute right-2 top-2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Copy response"
            >
              {copied === activeTab ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Clipboard className="h-5 w-5" />
              )}
            </button>
            
            {responseTime > 0 && (
              <div className="absolute right-12 top-2.5 text-xs text-gray-500">
                {(responseTime / 1000).toFixed(1)}s
              </div>
            )}
            
            {isError ? (
              <div className="whitespace-pre-wrap rounded-md bg-red-50 p-4 text-sm text-red-800">
                {responseText}
              </div>
            ) : (
              <MarkdownRenderer content={responseText} />
            )}
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