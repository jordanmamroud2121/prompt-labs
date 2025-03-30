"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { createPrompt } from "@/lib/supabase/queries/prompts";
import { createResponse } from "@/lib/supabase/queries/responses";
import { ServiceName } from "@/lib/supabase/models";
import { getAIClient } from "@/lib/ai/clientFactory";
import { useAuth } from "./AuthContext";

export interface PromptState {
  selectedModels: string[];
  promptText: string;
  isLoading: boolean;
  responses: Record<string, string>;
  hasAttachments: boolean;
  attachments: File[];
  characterCount: number;
  selectedTemplateId: string | null;
  validationMessage: string | null;
}

interface PromptContextType extends PromptState {
  setSelectedModels: (models: string[]) => void;
  toggleModel: (model: string) => void;
  setPromptText: (text: string) => void;
  handlePromptSubmit: () => Promise<void>;
  resetPrompt: () => void;
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;
  clearAttachments: () => void;
  applyTemplateToPrompt: (templateId: string, templateText: string) => void;
  validatePrompt: () => boolean;
}

const MAX_PROMPT_LENGTH = 32000; // OpenAI's maximum token limit is around 4k, which is roughly 16k-32k chars

const defaultState: PromptState = {
  selectedModels: ["gpt-4"],
  promptText: "",
  isLoading: false,
  responses: {},
  hasAttachments: false,
  attachments: [],
  characterCount: 0,
  selectedTemplateId: null,
  validationMessage: null,
};

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<PromptState>(defaultState);

  // Update character count whenever prompt text changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      characterCount: prev.promptText.length,
    }));
  }, [state.promptText]);

  // Clear validation message after a short delay when text changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (state.validationMessage) {
        setState((prev) => ({ ...prev, validationMessage: null }));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.promptText, state.validationMessage]);

  const setSelectedModels = (models: string[]) => {
    setState((prev) => ({ ...prev, selectedModels: models }));
  };

  const toggleModel = (model: string) => {
    setState((prev) => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(model)
        ? prev.selectedModels.filter((m) => m !== model)
        : [...prev.selectedModels, model],
    }));
  };

  const setPromptText = (text: string) => {
    setState((prev) => ({ ...prev, promptText: text }));
  };

  const resetPrompt = () => {
    setState((prev) => ({
      ...prev,
      promptText: "",
      responses: {},
      attachments: [],
      hasAttachments: false,
      selectedTemplateId: null,
      validationMessage: null,
    }));
  };

  const addAttachment = (file: File) => {
    setState((prev) => ({
      ...prev,
      attachments: [...prev.attachments, file],
      hasAttachments: true,
    }));
  };

  const removeAttachment = (index: number) => {
    setState((prev) => {
      const newAttachments = [...prev.attachments];
      newAttachments.splice(index, 1);
      return {
        ...prev,
        attachments: newAttachments,
        hasAttachments: newAttachments.length > 0,
      };
    });
  };

  const clearAttachments = () => {
    setState((prev) => ({
      ...prev,
      attachments: [],
      hasAttachments: false,
    }));
  };

  const applyTemplateToPrompt = (templateId: string, templateText: string) => {
    setState((prev) => ({
      ...prev,
      promptText: templateText,
      selectedTemplateId: templateId,
    }));
  };

  const validatePrompt = (): boolean => {
    if (!state.promptText.trim()) {
      setState((prev) => ({
        ...prev,
        validationMessage: "Prompt text cannot be empty",
      }));
      return false;
    }

    if (state.promptText.length > MAX_PROMPT_LENGTH) {
      setState((prev) => ({
        ...prev,
        validationMessage: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters`,
      }));
      return false;
    }

    if (state.selectedModels.length === 0) {
      setState((prev) => ({
        ...prev,
        validationMessage: "Please select at least one AI model",
      }));
      return false;
    }

    return true;
  };

  const handlePromptSubmit = async () => {
    if (!validatePrompt() || state.isLoading || !user) {
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, responses: {} }));

    try {
      // Save prompt to database (commented out for now since we're using mock responses)
      const savedPrompt = await createPrompt({
        user_id: user.id,
        prompt_text: state.promptText,
        is_favorite: false,
        template_id: state.selectedTemplateId ?? undefined,
      });

      // Temporary: use mock responses
      const responses: Record<string, string> = {};
      const responsePromises = state.selectedModels.map(async (modelId) => {
        try {
          // Identify which service this model belongs to
          let serviceName: ServiceName = "openai";

          if (modelId.includes("gpt")) {
            serviceName = "openai";
          } else if (modelId.includes("claude")) {
            serviceName = "anthropic";
          } else if (modelId.includes("gemini")) {
            serviceName = "gemini";
          } else if (modelId.includes("deepseek")) {
            serviceName = "deepseek";
          }

          // Get the client for this service
          const client = getAIClient(serviceName);

          // Generate response using the client
          const aiResponse = await client.generateCompletion({
            prompt: state.promptText,
            attachments: state.hasAttachments ? state.attachments : undefined,
          });

          // Store the response
          responses[modelId] = aiResponse.text;

          // Save the response to the database
          await createResponse({
            prompt_id: savedPrompt.id,
            service_name: serviceName,
            response_text: aiResponse.text,
            execution_time: aiResponse.executionTime,
            tokens_used: aiResponse.tokensUsed,
          });
        } catch (error) {
          console.error(`Error generating response from ${modelId}:`, error);
          responses[modelId] =
            `Error: Failed to generate response from ${modelId}`;
        }
      });

      // Wait for all responses to complete
      await Promise.all(responsePromises);

      setState((prev) => ({
        ...prev,
        responses,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error submitting prompt:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        validationMessage: "Failed to submit prompt. Please try again.",
      }));
    }
  };

  const value = useMemo(
    () => ({
      ...state,
      setSelectedModels,
      toggleModel,
      setPromptText,
      handlePromptSubmit,
      resetPrompt,
      addAttachment,
      removeAttachment,
      clearAttachments,
      applyTemplateToPrompt,
      validatePrompt,
    }),
    [state, handlePromptSubmit, validatePrompt],
  );

  return (
    <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
}
