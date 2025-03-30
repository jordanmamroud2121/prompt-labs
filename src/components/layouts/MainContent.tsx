"use client";

import { usePrompt } from "@/context/PromptContext";
import ModelSelector from "../ai/ModelSelector";
import PromptInput from "../prompt/PromptInput";
import ResponseTabs from "../response/ResponseTabs";

export default function MainContent() {
  const { selectedModels, responses, isLoading } = usePrompt();

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <ModelSelector />
      </div>

      <div className="mb-6 rounded-md border border-gray-200 bg-white p-4">
        <PromptInput />
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
