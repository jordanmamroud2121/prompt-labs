import { AIClient, AIRequest, AIResponse, StreamingChunk } from "./types";
import { MODELS } from "./modelData";

export class PerplexityClient implements AIClient {
  name = "Perplexity";
  models = MODELS.filter(model => model.provider === "Perplexity").map(model => model.id);
  supportsAttachments = false;
  supportsStreaming = true;
  private apiKey: string = "";
  private defaultModel = "sonar-small-online";
  private baseUrl = "https://api.perplexity.ai";

  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error("Perplexity API key is required");
    }

    const startTime = Date.now();
    const model = this.getModelFromRequest(request);
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
          stream: false
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Perplexity API error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      return {
        text: data.choices[0].message.content,
        model: data.model,
        executionTime,
        tokensUsed: data.usage?.total_tokens
      };
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      return {
        text: "",
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
      throw new Error("Perplexity API key is required");
    }

    const model = this.getModelFromRequest(request);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Perplexity API error: ${response.status}`);
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
            console.error('Error parsing Perplexity stream:', e);
          }
        }
      }
    } catch (error) {
      console.error("Error in Perplexity streaming:", error);
      throw error;
    }
  }

  private getModelFromRequest(request: AIRequest): string {
    // Check if model ID was passed directly in the request
    const modelId = request.options?.modelId as string;
    if (modelId && this.models.includes(modelId)) {
      return modelId;
    }
    
    // Otherwise use default model
    return this.defaultModel;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error("Error validating Perplexity API key:", error);
      return false;
    }
  }
} 