"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { createPrompt } from "@/lib/supabase/queries/prompts";
import { createResponse } from "@/lib/supabase/queries/responses";
import { ServiceName } from "@/lib/supabase/models";
import { getAIClient } from "@/lib/ai/clientFactory";
import { useAuth } from "./AuthContext";
import { MODELS } from "@/lib/ai/modelData";
// import { toast } from "@/components/ui/use-toast";

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
  errorMessage: string | null;
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
  getCompatibleModels: () => string[];
  clearError: () => void;
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
  errorMessage: null,
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

  const setSelectedModels = useCallback((models: string[]) => {
    setState((prev) => ({ ...prev, selectedModels: models }));
  }, []);

  const toggleModel = useCallback((model: string) => {
    setState((prev) => ({
      ...prev,
      selectedModels: prev.selectedModels.includes(model)
        ? prev.selectedModels.filter((m) => m !== model)
        : [...prev.selectedModels, model],
    }));
  }, []);

  const setPromptText = useCallback((text: string) => {
    setState((prev) => ({ ...prev, promptText: text }));
  }, []);

  const resetPrompt = useCallback(() => {
    setState((prev) => ({
      ...prev,
      promptText: "",
      responses: {},
      attachments: [],
      hasAttachments: false,
      selectedTemplateId: null,
      validationMessage: null,
      errorMessage: null,
    }));
  }, []);

  const addAttachment = useCallback((file: File) => {
    setState((prev) => {
      // Check if adding this attachment would make some models incompatible
      const newAttachments = [...prev.attachments, file];
      const hasImages = newAttachments.some(file => 
        file.type.startsWith('image/'));
      
      // Filter selected models to only include those that support images
      let newSelectedModels = prev.selectedModels;
      if (hasImages) {
        // Check in a single go if we need to filter models
        const compatibleModels = MODELS.filter(model => 
          model.capabilities.images && 
          prev.selectedModels.includes(model.id)
        ).map(model => model.id);
        
        // Only update if we need to filter out incompatible models
        if (compatibleModels.length < prev.selectedModels.length) {
          newSelectedModels = compatibleModels;
          
          // We'll set the error message in a separate update to avoid potential loop
          setTimeout(() => {
            setState(prevState => {
              // Only set the error message if it hasn't changed in the meantime
              if (!prevState.errorMessage) {
                return {
                  ...prevState,
                  errorMessage: "Some selected models don't support image attachments and have been removed."
                };
              }
              return prevState;
            });
          }, 0);
        }
      }
      
      return {
        ...prev,
        attachments: newAttachments,
        hasAttachments: true,
        selectedModels: newSelectedModels,
      };
    });
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setState((prev) => {
      const newAttachments = [...prev.attachments];
      newAttachments.splice(index, 1);
      return {
        ...prev,
        attachments: newAttachments,
        hasAttachments: newAttachments.length > 0,
      };
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setState((prev) => ({
      ...prev,
      attachments: [],
      hasAttachments: false,
    }));
  }, []);

  const applyTemplateToPrompt = useCallback((templateId: string, templateText: string) => {
    setState((prev) => ({
      ...prev,
      promptText: templateText,
      selectedTemplateId: templateId,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      errorMessage: null,
    }));
  }, []);

  // Get models that are compatible with current attachments
  const getCompatibleModels = useCallback((): string[] => {
    // Return early if we don't have attachments
    if (!state.hasAttachments || state.attachments.length === 0) {
      return MODELS.map(model => model.id);
    }
    
    const hasImages = state.attachments.some(file => 
      file.type.startsWith('image/'));
    
    const hasAudio = state.attachments.some(file => 
      file.type.startsWith('audio/'));
      
    const hasVideo = state.attachments.some(file => 
      file.type.startsWith('video/'));
    
    // Return filtered models based on capabilities
    return MODELS.filter(model => {
      if (hasImages && !model.capabilities.images) return false;
      if (hasAudio && !model.capabilities.audio) return false;
      if (hasVideo && !model.capabilities.video) return false;
      return true;
    }).map(model => model.id);
  }, [state.hasAttachments, state.attachments]);

  const validatePrompt = useCallback((): boolean => {
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

    // Check if all selected models support the current attachments
    if (state.hasAttachments) {
      const compatibleModels = getCompatibleModels();
      const incompatibleModels = state.selectedModels.filter(
        modelId => !compatibleModels.includes(modelId)
      );
      
      if (incompatibleModels.length > 0) {
        const incompatibleNames = incompatibleModels
          .map(id => MODELS.find(m => m.id === id)?.name || id)
          .join(', ');
        
        setState((prev) => ({
          ...prev,
          validationMessage: `The following models don't support the attached files: ${incompatibleNames}`,
        }));
        return false;
      }
    }

    return true;
  }, [state.promptText, state.selectedModels, state.hasAttachments, getCompatibleModels]);

  const handlePromptSubmit = useCallback(async () => {
    if (!validatePrompt() || state.isLoading || !user) {
      return;
    }

    setState((prev) => ({ 
      ...prev, 
      isLoading: true, 
      responses: {},
      errorMessage: null 
    }));

    try {
      // Save prompt to database
      const savedPrompt = await createPrompt({
        user_id: user.id,
        prompt_text: state.promptText,
        is_favorite: false,
        template_id: state.selectedTemplateId ?? undefined,
      });

      // Process responses for each selected model
      const responses: Record<string, string> = {};
      const responsePromises = state.selectedModels.map(async (modelId) => {
        try {
          // Identify which service this model belongs to
          let serviceName: ServiceName = "openai";
          const model = MODELS.find(m => m.id === modelId);
          
          if (!model) {
            throw new Error(`Unknown model: ${modelId}`);
          }
          
          switch (model.provider.toLowerCase()) {
            case "openai":
              serviceName = "openai";
              break;
            case "anthropic":
              serviceName = "anthropic";
              break;
            case "google":
              serviceName = "gemini";
              break;
            case "perplexity":
              serviceName = "perplexity";
              break;
            case "deepseek":
              serviceName = "deepseek";
              break;
            default:
              serviceName = "openai";
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
          responses[modelId] = `Error: Failed to generate response from ${modelId}`;
          
          // Set error message
          setState(prevState => ({
            ...prevState,
            errorMessage: `Failed to generate response: ${(error as Error).message || 'Unknown error'}`
          }));
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
        errorMessage: `Failed to submit prompt: ${(error as Error).message || 'Unknown error'}`,
      }));
    }
  }, [state.promptText, state.selectedModels, state.hasAttachments, 
      state.attachments, state.selectedTemplateId, user, validatePrompt]);

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
      getCompatibleModels,
      clearError,
    }),
    [
      state,
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
      getCompatibleModels,
      clearError,
    ]
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
