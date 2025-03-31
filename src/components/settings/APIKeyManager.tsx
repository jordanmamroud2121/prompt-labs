"use client";

import React, { useState } from "react";
import { useAPIKeys } from "@/context/APIKeyContext";
import { AI_PROVIDERS } from "@/lib/ai/modelData";
import { Check, AlertCircle, Loader2 } from "lucide-react";

export default function APIKeyManager() {
  const {
    apiKeys,
    validationStatus,
    saveApiKey,
    deleteApiKey,
    usingEnvVars,
    error,
  } = useAPIKeys();

  const [newKeys, setNewKeys] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  // Filter providers to only include OpenAI, Google, and Anthropic (most common)
  const mainProviders = AI_PROVIDERS.filter(
    (provider) =>
      provider === "OpenAI" ||
      provider === "Google" ||
      provider === "Anthropic" ||
      provider === "Perplexity" ||
      provider === "DeepSeek",
  );

  const handleInputChange = (provider: string, value: string) => {
    setNewKeys((prev) => ({
      ...prev,
      [provider.toLowerCase()]: value,
    }));
  };

  const handleSubmit = async (provider: string) => {
    const providerLower = provider.toLowerCase();
    const key = newKeys[providerLower]?.trim();

    if (!key) return;

    setIsSubmitting((prev) => ({ ...prev, [providerLower]: true }));

    try {
      await saveApiKey(providerLower, key);
      // Clear the input after successful save
      setNewKeys((prev) => ({ ...prev, [providerLower]: "" }));
    } catch (err) {
      console.error(`Error saving API key for ${provider}:`, err);
      // Don't clear the input in case of error so user can try again
    } finally {
      setIsSubmitting((prev) => ({ ...prev, [providerLower]: false }));
    }
  };

  const handleDelete = async (provider: string) => {
    const providerLower = provider.toLowerCase();

    // Add a simple confirmation to prevent accidental deletions
    if (!confirm(`Are you sure you want to remove your ${provider} API key?`)) {
      return;
    }

    try {
      await deleteApiKey(providerLower);
    } catch (err) {
      console.error(`Error deleting API key for ${provider}:`, err);
    }
  };

  const getStatusIndicator = (provider: string) => {
    const providerLower = provider.toLowerCase();
    const status = validationStatus[providerLower];

    if (status === "checking") {
      return <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />;
    }

    if (status === "valid") {
      return <Check className="h-3 w-3 text-green-500" />;
    }

    if (status === "invalid") {
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    }

    return null;
  };

  return (
    <div className="space-y-3">
      {error && <div className="text-xs text-red-600">{error}</div>}

      {mainProviders.map((provider) => {
        const providerLower = provider.toLowerCase();
        const hasApiKey = apiKeys[providerLower] !== undefined;
        const isUsingEnvVar = usingEnvVars[providerLower];

        return (
          <div key={provider} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                {provider}
              </label>
              <div className="flex items-center space-x-1">
                {getStatusIndicator(provider)}
                {isUsingEnvVar && (
                  <span className="text-xs text-blue-600">(env)</span>
                )}
              </div>
            </div>

            {hasApiKey && !isUsingEnvVar ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">•••••••••••••••</span>
                <button
                  onClick={() => handleDelete(provider)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ) : isUsingEnvVar ? (
              <span className="text-xs text-blue-600">
                Using environment variable
              </span>
            ) : (
              <div className="flex items-center space-x-1">
                <input
                  type="password"
                  placeholder={`${provider} API Key`}
                  className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={newKeys[providerLower] || ""}
                  onChange={(e) => handleInputChange(provider, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit(provider);
                    }
                  }}
                />
                <button
                  onClick={() => handleSubmit(provider)}
                  disabled={
                    isSubmitting[providerLower] ||
                    !newKeys[providerLower]?.trim()
                  }
                  className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                >
                  {isSubmitting[providerLower] ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
