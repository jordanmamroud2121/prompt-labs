/**
 * AI client types and interfaces
 */

export interface AIRequestOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface AIRequest {
  prompt: string;
  attachments?: File[];
  options?: AIRequestOptions;
}

export interface AIResponse {
  text: string;
  model: string;
  executionTime: number;
  tokensUsed?: number;
  error?: string;
}

export interface StreamingChunk {
  text: string;
  isComplete: boolean;
}

export interface AIClient {
  name: string;
  models: string[];
  supportsAttachments: boolean;
  supportsStreaming: boolean;

  /**
   * Generate a completion from the AI service
   */
  generateCompletion(request: AIRequest): Promise<AIResponse>;

  /**
   * Generate a streaming completion from the AI service
   */
  generateStreamingCompletion?(
    request: AIRequest,
    onChunk: (chunk: StreamingChunk) => void,
  ): Promise<void>;

  /**
   * Validate the API key for this service
   */
  validateApiKey(apiKey: string): Promise<boolean>;
}

export type ServiceName = "openai" | "anthropic" | "gemini" | "deepseek";
