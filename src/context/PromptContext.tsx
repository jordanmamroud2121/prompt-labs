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
import { initializeClient } from "@/lib/ai/clientFactory";
import { useAuth } from "./AuthContext";
import { MODELS } from "@/lib/ai/modelData";
import { useAPIKeys } from "./APIKeyContext";
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
  responseTimes: Record<string, number>;
  progressStatus: Record<string, number>;
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
  responseTimes: {},
  progressStatus: {},
};

const PromptContext = createContext<PromptContextType | undefined>(undefined);

// Fix the provider to service mapping with proper type safety
const PROVIDER_TO_SERVICE: Record<string, ServiceName> = {
  openai: "openai",
  anthropic: "anthropic",
  google: "gemini",
  deepseek: "deepseek",
  perplexity: "perplexity",
} as const;

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const apiKeyContext = useAPIKeys();
  const [state, setState] = useState<PromptState>(defaultState);

  // Log API keys for troubleshooting (keys will be masked for security)
  useEffect(() => {
    if (apiKeyContext) {
      console.log(
        "Available API services:",
        Object.keys(apiKeyContext.apiKeys || {}),
      );
      console.log(
        "OpenAI key available in context:",
        !!apiKeyContext.apiKeys?.openai,
      );
      console.log(
        "OpenAI key validation status:",
        apiKeyContext.validationStatus?.openai,
      );
      console.log(
        "Using environment variables:",
        apiKeyContext.usingEnvVars?.openai,
      );
    }
  }, [apiKeyContext]);

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
      responseTimes: {},
      progressStatus: {},
    }));
  }, []);

  const addAttachment = useCallback((file: File) => {
    setState((prevState) => {
      // Create new attachments array
      const newAttachments = [...prevState.attachments, file];
      const hasImages = newAttachments.some((file) =>
        file.type.startsWith("image/"),
      );

      // Get compatible models in a type-safe way
      const compatibleModels = MODELS.filter(
        (model) =>
          model.capabilities.images &&
          prevState.selectedModels.includes(model.id),
      ).map((model) => model.id);

      // Check if we need to filter out models
      const shouldFilterModels =
        hasImages && compatibleModels.length < prevState.selectedModels.length;

      // Prepare the new state
      const newState: Partial<PromptState> = {
        attachments: newAttachments,
        hasAttachments: true,
      };

      // Update selected models if needed
      if (shouldFilterModels) {
        newState.selectedModels = compatibleModels;
        newState.errorMessage =
          "Some selected models don't support image attachments and have been removed.";
      }

      return { ...prevState, ...newState };
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

  const applyTemplateToPrompt = useCallback(
    (templateId: string, templateText: string) => {
      setState((prev) => ({
        ...prev,
        promptText: templateText,
        selectedTemplateId: templateId,
      }));
    },
    [],
  );

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errorMessage: null,
    }));
  }, []);

  // Get models that are compatible with current attachments
  const getCompatibleModels = useCallback((): string[] => {
    // Return early if we don't have attachments
    if (!state.hasAttachments || state.attachments.length === 0) {
      return MODELS.map((model) => model.id);
    }

    const hasImages = state.attachments.some((file) =>
      file.type.startsWith("image/"),
    );
    const hasAudio = state.attachments.some((file) =>
      file.type.startsWith("audio/"),
    );
    const hasVideo = state.attachments.some((file) =>
      file.type.startsWith("video/"),
    );

    // Return filtered models based on capabilities
    return MODELS.filter((model) => {
      if (hasImages && !model.capabilities.images) return false;
      if (hasAudio && !model.capabilities.audio) return false;
      if (hasVideo && !model.capabilities.video) return false;
      return true;
    }).map((model) => model.id);
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
        (modelId) => !compatibleModels.includes(modelId),
      );

      if (incompatibleModels.length > 0) {
        const incompatibleNames = incompatibleModels
          .map((id) => MODELS.find((m) => m.id === id)?.name || id)
          .join(", ");

        setState((prev) => ({
          ...prev,
          validationMessage: `The following models don't support the attached files: ${incompatibleNames}`,
        }));
        return false;
      }
    }

    return true;
  }, [
    state.promptText,
    state.selectedModels,
    state.hasAttachments,
    getCompatibleModels,
  ]);

  const handlePromptSubmit = useCallback(async () => {
    console.log("=== PROMPT SUBMISSION STARTED ===");
    console.log("State:", {
      promptText:
        state.promptText.substring(0, 100) +
        (state.promptText.length > 100 ? "..." : ""),
      selectedModels: state.selectedModels,
      hasUser: !!user,
      userId: user?.id || "anonymous",
      apiKeysAvailable: Object.keys(apiKeyContext?.apiKeys || {}),
    });

    // Validate the prompt before submission
    if (!validatePrompt()) {
      console.log("Prompt validation failed");
      return;
    }

    // Set loading state
    setState((prev) => ({
      ...prev,
      isLoading: true,
      responses: {},
      responseTimes: {},
      progressStatus: Object.fromEntries(
        prev.selectedModels.map((model) => [model, 0]),
      ),
    }));

    try {
      // Save prompt to database
      const promptRecord = await createPrompt({
        user_id: user?.id || "anonymous",
        prompt_text: state.promptText,
        is_favorite: false,
        attachments: state.hasAttachments
          ? state.attachments.map((file) => URL.createObjectURL(file))
          : undefined,
        template_id: state.selectedTemplateId || undefined,
      });

      console.log("Created prompt record:", promptRecord);

      // Process each selected model concurrently
      const modelRequests = state.selectedModels.map(async (modelId) => {
        try {
          const startTime = Date.now();

          // Get model information
          const modelInfo = MODELS.find((m) => m.id === modelId);
          if (!modelInfo) {
            throw new Error(`Unknown model: ${modelId}`);
          }

          // Map provider to correct service name using our mapping
          const providerName = modelInfo.provider.toLowerCase();
          const service =
            PROVIDER_TO_SERVICE[providerName] ||
            (() => {
              throw new Error(
                `Unknown service for provider: ${modelInfo.provider}`,
              );
            })();

          console.log(
            `Processing request for model ${modelId} using ${service} service`,
          );

          // Update progress status to show we're starting
          setState((prev) => ({
            ...prev,
            progressStatus: {
              ...prev.progressStatus,
              [modelId]: 5, // 5% - started
            },
          }));

          // Check if we have the necessary API key
          const userApiKey = apiKeyContext?.apiKeys?.[service];
          const envApiKey =
            process.env[`NEXT_PUBLIC_${service.toUpperCase()}_API_KEY`];

          console.log(`API key status for ${service}:`, {
            userKeyAvailable: !!userApiKey,
            envKeyAvailable: !!envApiKey,
          });

          // Initialize the client
          const client = await initializeClient(service, userApiKey);
          console.log(`Client initialized for ${service}:`, {
            hasClient: !!client,
            clientType: client?.constructor?.name,
          });

          // Update progress status
          setState((prev) => ({
            ...prev,
            progressStatus: {
              ...prev.progressStatus,
              [modelId]: 20, // 20% - client initialized
            },
          }));

          console.log(`Sending prompt to ${modelId}...`);
          // Send the prompt to the AI service
          const response = await client.generateCompletion({
            prompt: state.promptText,
            options: {
              modelId,
              temperature: 0.7,
              maxTokens: 2048,
            },
          });

          console.log(`Received response from ${modelId}`);

          // Calculate time taken
          const endTime = Date.now();
          const timeTaken = endTime - startTime;

          // Update progress to indicate completion
          setState((prev) => ({
            ...prev,
            progressStatus: {
              ...prev.progressStatus,
              [modelId]: 100, // 100% - completed
            },
          }));

          // Save the response to database
          if (promptRecord) {
            await createResponse({
              prompt_id: promptRecord.id,
              service_name: service,
              response_text: response.text,
              tokens_used: response.tokensUsed || 0,
              execution_time: timeTaken,
              error: response.error || undefined,
            });
          }

          // Add response to state
          setState((prev) => ({
            ...prev,
            responses: {
              ...prev.responses,
              [modelId]: response.text,
            },
            responseTimes: {
              ...prev.responseTimes,
              [modelId]: timeTaken,
            },
          }));

          // And then add logging for the response
          console.log(`Response received from ${modelId}:`, {
            responseLength: response.text.length,
            executionTime: timeTaken,
            hasError: !!response.error,
            errorText: response.error,
          });
          // If the response looks suspicious (like a mock), log it
          if (
            response.text.includes("This is a mock response") ||
            response.text.includes("API key is required")
          ) {
            console.warn(
              "POSSIBLE MOCK RESPONSE DETECTED:",
              response.text.substring(0, 100),
            );
          }

          return { modelId, success: true };
        } catch (error) {
          console.error(`Error with model ${modelId}:`, error);

          // Add error response to state
          setState((prev) => ({
            ...prev,
            responses: {
              ...prev.responses,
              [modelId]: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
            },
            progressStatus: {
              ...prev.progressStatus,
              [modelId]: 100, // 100% but with error
            },
          }));

          return { modelId, success: false, error };
        }
      });

      // Wait for all requests to complete
      await Promise.all(modelRequests);
    } catch (error) {
      console.error("Error submitting prompt:", error);
      setState((prev) => ({
        ...prev,
        errorMessage:
          error instanceof Error ? error.message : "Error submitting prompt",
      }));
    } finally {
      // Clear loading state
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [
    state.promptText,
    state.selectedModels,
    state.hasAttachments,
    state.attachments,
    state.selectedTemplateId,
    apiKeyContext,
    validatePrompt,
    user,
  ]);

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
    ],
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
