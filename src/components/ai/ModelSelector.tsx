"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { usePrompt } from "@/context/PromptContext";
import { useAPIKeys } from "@/context/APIKeyContext";
import { MODELS, AIModel, AIProvider } from "@/lib/ai/modelData";

export default function ModelSelector() {
  const { 
    selectedModels, 
    setSelectedModels, 
    attachments,
    getCompatibleModels 
  } = usePrompt();
  const { 
    hasValidApiKeyFor, 
    apiKeys,
    isLoading: isLoadingApiKeys
  } = useAPIKeys();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use useMemo for compatibleModelIds to avoid recalculation on every render
  const compatibleModelIds = useMemo(() => getCompatibleModels(), 
    // Fix dependency array to remove complex expression
    [getCompatibleModels, attachments.length]
  );

  // Filter models to only show ones from OpenAI and Google (we have env vars for these)
  // as well as any other providers the user has API keys for
  const availableModels = useMemo(() => {
    return MODELS.filter(model => {
      const provider = model.provider.toLowerCase();
      
      // Always show OpenAI and Google models
      if (provider === 'openai' || provider === 'google') {
        return true;
      }
      
      // Only show other models if we have API keys for them
      return apiKeys[provider] !== undefined;
    });
  }, [apiKeys]);

  // Group available models by provider
  const modelsByProvider = useMemo(() => {
    // Get unique providers from available models
    const providers = Array.from(new Set(availableModels.map(model => model.provider))) as AIProvider[];
    
    // Group models by provider
    return providers.reduce((acc, provider) => {
      acc[provider] = availableModels.filter(model => model.provider === provider);
      return acc;
    }, {} as Record<AIProvider, AIModel[]>);
  }, [availableModels]);

  // Get list of available providers (ones we're displaying)
  const availableProviders = useMemo(() => {
    return Object.keys(modelsByProvider) as AIProvider[];
  }, [modelsByProvider]);

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const savedModels = localStorage.getItem('selectedModels');
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels);
        if (Array.isArray(parsedModels) && parsedModels.length > 0) {
          // Filter out any models that might not be compatible with current attachments
          // and from providers we don't have API keys for
          const modelIds = availableModels.map(model => model.id);
          const filteredModels = parsedModels.filter(modelId => 
            compatibleModelIds.includes(modelId) && modelIds.includes(modelId)
          );
          
          if (filteredModels.length > 0) {
            setSelectedModels(filteredModels);
          }
        }
      } catch (error) {
        console.error('Error parsing saved models:', error);
      }
    }
    // Only run this effect when the component mounts or when availableModels change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSelectedModels, availableModels.length, compatibleModelIds.length]);

  // Save user preferences to localStorage when selectedModels changes
  useEffect(() => {
    if (selectedModels.length > 0) {
      localStorage.setItem('selectedModels', JSON.stringify(selectedModels));
    }
  }, [selectedModels]);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
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
    const model = MODELS.find(m => m.id === modelId);
    
    if (!model) return;
    
    // Check if model requires API key and if it's valid
    if (model.requiresApiKey && !hasValidApiKeyFor(model.provider.toLowerCase())) {
      // Don't allow selection if API key is invalid
      return;
    }
    
    // Check if model is compatible with current attachments
    if (!getCompatibleModels().includes(modelId)) {
      return;
    }
    
    const newModels = selectedModels.includes(modelId)
      ? selectedModels.filter((id) => id !== modelId)
      : [...selectedModels, modelId];
    setSelectedModels(newModels);
  };

  const removeModel = (modelId: string) => {
    const newModels = selectedModels.filter((id) => id !== modelId);
    setSelectedModels(newModels);
  };

  // Check if a model can be selected based on API key status (user or environment) and compatibility
  const canSelectModel = (model: AIModel): boolean => {
    // First check if model is compatible with current attachments
    if (!getCompatibleModels().includes(model.id)) return false;
    
    // Then check if model requires API key - allow selection if it doesn't require an API key
    if (!model.requiresApiKey) return true;
    
    // Return whether we have a valid key
    return hasValidApiKeyFor(model.provider.toLowerCase());
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
            disabled={isLoadingApiKeys}
          >
            <span>{isLoadingApiKeys ? 'Loading...' : 'Select Models'}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Dropdown menu */}
          {isOpen && (
            <div className="absolute z-10 mt-1 w-64 max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
              <div className="p-2">
                {availableProviders.map((provider) => (
                  <div key={provider} className="mb-3">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-50 rounded">
                      {provider}
                    </div>
                    <div className="mt-1">
                      {modelsByProvider[provider].map((model) => (
                        <div
                          key={model.id}
                          className="relative"
                        >
                          <button
                            onClick={() => toggleModel(model.id)}
                            className={`flex items-center w-full px-2 py-1.5 text-sm text-left rounded
                              ${!canSelectModel(model) 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'hover:bg-gray-100'}`}
                            disabled={!canSelectModel(model)}
                          >
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
                          </button>
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
