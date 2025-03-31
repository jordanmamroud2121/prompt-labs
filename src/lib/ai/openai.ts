import { AIClient, AIRequest, AIResponse, StreamingChunk } from "./types";
import { MODELS } from "./modelData";

export class OpenAIClient implements AIClient {
  name = "OpenAI";
  models = MODELS.filter(model => model.provider === "OpenAI").map(model => model.id);
  supportsAttachments = true;
  supportsStreaming = true;
  private apiKey: string = "";
  private defaultModel = "gpt-4o";

  constructor(apiKey?: string) {
    console.log("OpenAIClient constructor called, apiKey provided:", !!apiKey);
    
    if (apiKey) {
      this.apiKey = apiKey;
      console.log("API key set from provided key");
    } else if (typeof window === 'undefined' && process.env.OPENAI_API_KEY) {
      // Use environment variable as fallback (server-side only)
      this.apiKey = process.env.OPENAI_API_KEY;
      console.log("Using OpenAI API key from server environment variables");
    }
  }

  setApiKey(apiKey: string) {
    console.log("Setting OpenAI API key manually");
    this.apiKey = apiKey;
  }

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    console.log("generateCompletion called, apiKey available:", !!this.apiKey);
    
    if (!this.apiKey) {
      console.log("No API key available, will use server-side proxy");
    }

    const startTime = Date.now();
    const model = this.getModelFromRequest(request);
    
    try {
      console.log(`Preparing OpenAI request for model: ${model}`);
      
      // Define the request body type
      type OpenAIRequestBody = {
        model: string;
        messages: { role: string; content: string }[];
        max_tokens?: number;
        temperature?: number;
        top_p?: number;
        presence_penalty?: number;
        frequency_penalty?: number;
        stop?: string[];
        stream: boolean;
      };
      
      // Prepare the request body
      const requestBody: OpenAIRequestBody = {
        model,
        messages: [
          { 
            role: "user", 
            content: request.prompt
          }
        ],
        stream: false
      };

      // Add optional parameters only if they're defined
      if (request.options?.maxTokens) requestBody.max_tokens = request.options.maxTokens;
      if (request.options?.temperature !== undefined) requestBody.temperature = request.options.temperature;
      if (request.options?.topP !== undefined) requestBody.top_p = request.options.topP;
      if (request.options?.presencePenalty !== undefined) requestBody.presence_penalty = request.options.presencePenalty;
      if (request.options?.frequencyPenalty !== undefined) requestBody.frequency_penalty = request.options.frequencyPenalty;
      if (request.options?.stopSequences) requestBody.stop = request.options.stopSequences;

      console.log("OpenAI request body:", JSON.stringify(requestBody));

      // Use server-side API proxy route instead of direct API call
      const response = await fetch("/api/ai/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      console.log("OpenAI API response status:", response.status);

      if (!response.ok) {
        console.error("OpenAI API error status:", response.status);
        let errorMessage = `OpenAI API error: Status ${response.status}`;
        
        try {
          // Try to parse the error response as JSON
          const errorData = await response.json();
          console.error("OpenAI API error data:", errorData);
          
          // Extract error message from various possible structures
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error?.type) {
            errorMessage = `${errorData.error.type}: ${errorData.error.param || 'unknown parameter'}`;
          }
        } catch (parseError) {
          // If we can't parse the response as JSON, use the response text if available
          console.error("Error parsing OpenAI error response:", parseError);
          try {
            const textResponse = await response.text();
            if (textResponse) {
              errorMessage += ` - ${textResponse}`;
            }
          } catch (textError) {
            console.error("Error getting response text:", textError);
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("OpenAI API response:", data);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      if (!data || typeof data !== 'object') {
        console.error("Invalid response format from OpenAI (not an object):", data);
        throw new Error("Invalid response format from OpenAI API");
      }

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error("Invalid or empty choices in OpenAI response:", data);
        throw new Error("No choices returned from OpenAI API");
      }

      const choice = data.choices[0];
      if (!choice.message || typeof choice.message !== 'object' || !choice.message.content) {
        console.error("Invalid message structure in OpenAI response:", choice);
        throw new Error("Invalid message structure in OpenAI response");
      }

      return {
        text: choice.message.content,
        model: data.model || model,
        executionTime,
        tokensUsed: data.usage?.total_tokens
      };
    } catch (error) {
      console.error("Error in OpenAI request:", error);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      return {
        text: "Error: " + (error instanceof Error ? error.message : "Unknown error occurred"),
        model,
        executionTime,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async generateStreamingCompletion(
    request: AIRequest,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is required");
    }

    const model = this.getModelFromRequest(request);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: "user", 
              content: request.prompt
            }
          ],
          max_tokens: request.options?.maxTokens,
          temperature: request.options?.temperature,
          top_p: request.options?.topP,
          presence_penalty: request.options?.presencePenalty,
          frequency_penalty: request.options?.frequencyPenalty,
          stop: request.options?.stopSequences,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (done) {
          onChunk({ text: "", isComplete: true });
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => line.replace(/^data: /, ''));

        for (const line of lines) {
          if (line === '[DONE]') {
            onChunk({ text: "", isComplete: true });
            break;
          }

          try {
            const json = JSON.parse(line);
            const content = json.choices[0]?.delta?.content || '';
            if (content) {
              onChunk({ text: content, isComplete: false });
            }
          } catch (e) {
            console.error('Error parsing OpenAI stream:', e);
          }
        }
      }
    } catch (error) {
      console.error("Error in OpenAI streaming:", error);
      throw error;
    }
  }

  private getModelFromRequest(request: AIRequest): string {
    // Check if model ID was passed directly in the request
    const requestedModelId = request.options?.modelId;
    
    // Check if it's a valid string and one of our known models
    if (requestedModelId && typeof requestedModelId === 'string') {
      if (this.models.includes(requestedModelId)) {
        return requestedModelId;
      }
      
      // If model ID wasn't in our list of models, check if it's a valid OpenAI model ID anyway
      if (requestedModelId.startsWith('gpt-') || 
          requestedModelId.includes('ft:') || 
          requestedModelId.includes('instruct')) {
        console.log(`Model ${requestedModelId} not in our predefined list, but seems valid`);
        return requestedModelId;
      }
    }
    
    // Otherwise use default model
    console.log(`Using default model ${this.defaultModel} instead of ${requestedModelId || 'none'}`);
    return this.defaultModel;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey.trim() === '') {
      console.error("Empty API key provided for validation");
      return false;
    }
    
    console.log("Validating OpenAI API key (checking models endpoint)");
    
    try {
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey.trim()}`
        }
      });
      
      console.log("OpenAI key validation response status:", response.status);
      
      if (response.status === 401) {
        console.error("OpenAI API key is invalid (unauthorized)");
        return false;
      }
      
      if (response.status === 429) {
        console.warn("OpenAI API key rate limit exceeded during validation");
        // Consider the key valid but rate-limited
        return true;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API key validation failed with status ${response.status}:`, errorText);
        return false;
      }
      
      // Try to parse the models list to further validate
      try {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          // Found models list, key is valid
          console.log("OpenAI API key is valid, models endpoint returned data");
          return true;
        } else {
          console.error("OpenAI models endpoint returned unexpected data structure");
          return false;
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI models response:", parseError);
        // Assume key is valid if status was OK, even if parsing fails
        return true;
      }
    } catch (error) {
      console.error("Error validating OpenAI API key:", error);
      return false;
    }
  }
} 