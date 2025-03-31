import { AIClient, AIRequest, AIResponse, StreamingChunk } from "./types";
import { MODELS } from "./modelData";

export class GeminiClient implements AIClient {
  name = "Google Gemini";
  models = MODELS.filter((model) => model.provider === "Google").map(
    (model) => model.id,
  );
  supportsAttachments = true;
  supportsStreaming = true;
  private apiKey: string = "";
  private defaultModel = "gemini-1.5-pro";
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey?: string) {
    console.log("GeminiClient constructor called, apiKey provided:", !!apiKey);

    if (apiKey) {
      this.apiKey = apiKey;
      console.log("API key set from provided key");
    } else {
      console.log(
        "No API key provided in constructor, checking environment variables",
      );
      // Try to get the API key from environment variables
      const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (envKey) {
        this.apiKey = envKey;
        console.log("API key loaded from environment variables");
      } else {
        console.warn("No API key found in environment variables either");
      }
    }

    // Log the state of the API key
    console.log(
      "Gemini API key available after initialization:",
      !!this.apiKey,
    );
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(request: AIRequest): Promise<AIResponse> {
    console.log("Gemini generateCompletion called");
    console.log("Request details:", {
      promptLength: request.prompt.length,
      modelRequested: request.options?.modelId || this.defaultModel,
      attachments: request.attachments?.length || 0,
    });

    // Make one more attempt to get the API key if it's not set
    if (!this.apiKey) {
      console.log("No API key set, using server-side proxy");
    }

    const startTime = Date.now();
    const model = this.getModelFromRequest(request);

    try {
      console.log(`Preparing Gemini API call to ${model}`);

      const requestBody = {
        model,
        prompt: request.prompt,
        temperature: request.options?.temperature,
        top_p: request.options?.topP,
        max_tokens: request.options?.maxTokens,
      };

      console.log("Request body:", JSON.stringify(requestBody));

      // Make the API request via our server-side proxy
      const response = await fetch("/api/ai/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Gemini API response status:", response.status);

      // Check for response issues
      if (!response.ok) {
        let errorMessage = `Gemini API error: Status ${response.status}`;

        try {
          // Try to parse the error response
          const errorData = await response.json();
          console.error("Gemini API error data:", errorData);

          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          // If we can't parse as JSON, try to get the text
          console.error("Error parsing Gemini error response:", parseError);
          try {
            const textResponse = await response.text();
            if (textResponse) {
              errorMessage += ` - ${textResponse}`;
            }
          } catch (e) {
            console.error("Error getting response text:", e);
          }
        }

        throw new Error(errorMessage);
      }

      // Process the successful response
      const data = await response.json();
      console.log("Gemini API response data:", data);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Extract the text from the response
      const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      console.log(`Extracted content text (${contentText.length} chars)`);

      if (!contentText) {
        console.warn("No content text found in Gemini response:", data);
      }

      return {
        text: contentText,
        model,
        executionTime,
        tokensUsed: data.usageMetadata?.totalTokenCount,
      };
    } catch (error) {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      return {
        text: "",
        model,
        executionTime,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async generateStreamingCompletion(
    request: AIRequest,
    onChunk: (chunk: StreamingChunk) => void,
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error("Gemini API key is required");
    }

    const model = this.getModelFromRequest(request);

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: request.prompt }],
              },
            ],
            generationConfig: {
              temperature: request.options?.temperature,
              topP: request.options?.topP,
              maxOutputTokens: request.options?.maxTokens,
            },
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `Gemini API error: ${response.status}`,
        );
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
        // Gemini returns newline-delimited JSON objects
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (text) {
              onChunk({ text, isComplete: false });
            }
          } catch (e) {
            console.error("Error parsing Gemini stream:", e);
          }
        }
      }

      // Signal completion
      onChunk({ text: "", isComplete: true });
    } catch (error) {
      console.error("Error in Gemini streaming:", error);
      throw error;
    }
  }

  private getModelFromRequest(request: AIRequest): string {
    // Check if model ID was passed directly in the request and is valid
    const requestedModelId = request.options?.modelId;

    if (
      requestedModelId &&
      typeof requestedModelId === "string" &&
      this.models.includes(requestedModelId)
    ) {
      return requestedModelId;
    }

    // Otherwise use default model
    return this.defaultModel;
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // Use a simple models list request to validate the API key
      const response = await fetch(`${this.baseUrl}/models?key=${apiKey}`);
      return response.ok;
    } catch (error) {
      console.error("Error validating Gemini API key:", error);
      return false;
    }
  }
}
