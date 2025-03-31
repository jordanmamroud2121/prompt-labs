"use client";

import { usePrompt } from "@/context/PromptContext";
import PromptInput from "@/components/prompt/PromptInput";
import ResponseTabs from "@/components/response/ResponseTabs";
import ModelSelector from "@/components/ai/ModelSelector";
import { AlertCircle } from "lucide-react";

export default function MainContent() {
  const { 
    selectedModels, 
    responses, 
    isLoading, 
    errorMessage, 
    clearError,
    responseTimes,
    progressStatus
  } = usePrompt();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-none p-4">
        <h1 className="mb-6 text-2xl font-semibold text-gray-800">PromptLab</h1>
        
        {/* Error message display */}
        {errorMessage && (
          <div className="mb-4 flex items-center rounded-md bg-red-50 p-3 text-sm text-red-800">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            <span>{errorMessage}</span>
            <button 
              onClick={clearError}
              className="ml-auto text-red-700 hover:text-red-900"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Model selector */}
        <div className="mb-6">
          <ModelSelector />
        </div>

        {/* Prompt input area */}
        <PromptInput />
      </div>

      {/* Response area */}
      <div className="flex-1 overflow-hidden border-t border-gray-200">
        <ResponseTabs 
          responses={responses} 
          selectedModels={selectedModels} 
          isLoading={isLoading}
          responseTimes={responseTimes}
          progressStatus={progressStatus}
        />
      </div>
    </div>
  );
}
