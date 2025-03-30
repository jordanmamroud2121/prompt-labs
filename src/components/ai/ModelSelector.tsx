"use client";

import React, { useRef, useState } from "react";
import { Check, ChevronDown, X, HelpCircle } from "lucide-react";
import { usePrompt } from "@/context/PromptContext";
import { MODELS, AI_PROVIDERS, AIModel, AIProvider } from "@/lib/ai/modelData";

export default function ModelSelector() {
  const { selectedModels, setSelectedModels } = usePrompt();
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipModel, setTooltipModel] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Group models by provider
  const modelsByProvider = AI_PROVIDERS.reduce(
    (acc, provider) => {
      acc[provider] = MODELS.filter((model) => model.provider === provider);
      return acc;
    },
    {} as Record<AIProvider, AIModel[]>,
  );

  // Handle clicking outside to close the dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleModel = (modelId: string) => {
    const newModels = selectedModels.includes(modelId)
      ? selectedModels.filter((id) => id !== modelId)
      : [...selectedModels, modelId];
    setSelectedModels(newModels);
  };

  const removeModel = (modelId: string) => {
    const newModels = selectedModels.filter((id) => id !== modelId);
    setSelectedModels(newModels);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Select AI Models</h2>

      <div className="flex flex-wrap gap-2 items-start">
        {/* Dropdown button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
          >
            <span>Select Models</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-64 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="p-2">
                {AI_PROVIDERS.map((provider) => (
                  <div key={provider} className="mb-3">
                    <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded">
                      {provider}
                    </h3>
                    <div className="mt-1">
                      {modelsByProvider[provider].map((model) => (
                        <div
                          key={model.id}
                          className="relative"
                          onMouseEnter={() => setTooltipModel(model.id)}
                          onMouseLeave={() => setTooltipModel(null)}
                        >
                          <button
                            onClick={() => toggleModel(model.id)}
                            className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-left hover:bg-gray-100 rounded"
                          >
                            <div className="flex items-center">
                              <div
                                className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                                  selectedModels.includes(model.id)
                                    ? "bg-indigo-600 border-indigo-600"
                                    : "border-gray-300"
                                }`}
                              >
                                {selectedModels.includes(model.id) && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span>{model.name}</span>
                            </div>
                            {model.description && (
                              <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </button>

                          {/* Tooltip */}
                          {tooltipModel === model.id && model.description && (
                            <div className="absolute left-full ml-2 top-0 z-20 w-48 p-2 text-xs bg-gray-800 text-white rounded shadow-lg">
                              {model.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected models */}
        <div className="flex flex-wrap gap-2">
          {selectedModels.map((modelId) => {
            const model = MODELS.find((m) => m.id === modelId);
            if (!model) return null;

            return (
              <div
                key={modelId}
                className="inline-flex items-center rounded-full border border-indigo-600 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
              >
                <span className="truncate max-w-[180px]">{model.name}</span>
                <button
                  onClick={() => removeModel(modelId)}
                  className="ml-1.5 rounded-full p-0.5 text-indigo-600 hover:bg-indigo-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
