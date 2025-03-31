import { AIClient, AIRequest, AIResponse, StreamingChunk } from "./types";
import { MODELS } from "./modelData";

export class AnthropicClient implements AIClient {
  name = "Anthropic";
  models = MODELS.filter(model => model.provider === "Anthropic").map(model => model.id);
  supportsAttachments = true;
  supportsStreaming = true;
  private apiKey: string = "";
  private defaultModel = "claude-3-opus-20240229";
  private baseUrl = "https://api.anthropic.com/v1/messages";
  private apiVersion = "2023-06-01";

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
      console.log("No API key set, using server-side proxy");
    }

    const startTime = Date.now();
    const model = this.getModelFromRequest(request);
    
    try {
      const requestBody = {
        model,
        prompt: request.prompt,
        max_tokens: request.options?.maxTokens || 4000,
        temperature: request.options?.temperature,
        top_p: request.options?.topP,
        stream: false
      };

      // Make the API request via our server-side proxy
      const response = await fetch("/api/ai/anthropic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
      }

      const data = await response.json();
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      return {
        text: data.content[0].text,
        model: data.model,
        executionTime,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens
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
      throw new Error("Anthropic API key is required");
    }

    const model = this.getModelFromRequest(request);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          "anthropic-version": this.apiVersion
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: "user", 
              content: request.prompt
            }
          ],
          max_tokens: request.options?.maxTokens || 4000,
          temperature: request.options?.temperature,
          top_p: request.options?.topP,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
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
          .filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onChunk({ text: "", isComplete: true });
              break;
            }

            try {
              const json = JSON.parse(data);
              if (json.type === 'content_block_delta') {
                const content = json.delta?.text || '';
                if (content) {
                  onChunk({ text: content, isComplete: false });
                }
              } else if (json.type === 'message_stop') {
                onChunk({ text: "", isComplete: true });
              }
            } catch (e) {
              console.error('Error parsing Anthropic stream:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in Anthropic streaming:", error);
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
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "anthropic-version": this.apiVersion
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [{ role: "user", content: "Hello" }],
          max_tokens: 10
        })
      });
      return response.ok;
    } catch (error) {
      console.error("Error validating Anthropic API key:", error);
      return false;
    }
  }
} 