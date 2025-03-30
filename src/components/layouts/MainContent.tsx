"use client";

import { useState } from "react";
import ModelSelection from "../ai/ModelSelection";
import PromptInput from "../prompt/PromptInput";
import ResponseTabs from "../response/ResponseTabs";

export default function MainContent() {
  const [selectedModels, setSelectedModels] = useState<string[]>(["gpt-4"]);
  const [promptText, setPromptText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleModelSelect = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model)
        ? prev.filter((m) => m !== model)
        : [...prev, model]
    );
  };

  const handlePromptChange = (text: string) => {
    setPromptText(text);
  };

  const handleSubmit = async () => {
    if (!promptText.trim() || selectedModels.length === 0) return;

    setIsLoading(true);
    
    // Mock response generation
    // This will be replaced with actual API calls later
    setTimeout(() => {
      const mockResponses: Record<string, string> = {};
      
      selectedModels.forEach((model) => {
        mockResponses[model] = `This is a sample response from ${model} for the prompt: "${promptText}"`;
      });
      
      setResponses(mockResponses);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <ModelSelection
          selectedModels={selectedModels}
          onSelect={handleModelSelect}
        />
      </div>

      <div className="mb-6 rounded-md border border-gray-200 bg-white p-4">
        <PromptInput
          value={promptText}
          onChange={handlePromptChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>

      <div className="flex-1 overflow-auto rounded-md border border-gray-200 bg-white">
        <ResponseTabs
          responses={responses}
          selectedModels={selectedModels}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
} 