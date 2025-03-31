"use client";

import { Check } from "lucide-react";

interface ModelSelectionProps {
  selectedModels: string[];
  onSelect: (model: string) => void;
}

// Available AI models
const AVAILABLE_MODELS = [
  { id: "gpt-4", name: "GPT-4" },
  { id: "ux-pilot", name: "UX Pilot" },
  { id: "gemini", name: "Gemini" },
];

export default function ModelSelection({
  selectedModels,
  onSelect,
}: ModelSelectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-gray-700">Select AI Models</h2>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          return (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <Check className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
              )}
              {model.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
