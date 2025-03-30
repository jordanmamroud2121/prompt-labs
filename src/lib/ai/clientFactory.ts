import { AIClient, ServiceName } from "./types";

// Import actual clients when they're implemented
// import { OpenAIClient } from "./openai";
// import { AnthropicClient } from "./anthropic";
// import { GeminiClient } from "./gemini";
// import { DeepSeekClient } from "./deepseek";

/**
 * Map of service names to mock client implementations
 */
const mockClients: Record<ServiceName, AIClient> = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4", "gpt-3.5-turbo"],
    supportsAttachments: true,
    supportsStreaming: true,

    async generateCompletion(request) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        text: `This is a mock response from OpenAI for: "${request.prompt}"`,
        model: "gpt-4",
        executionTime: 1500,
      };
    },

    async validateApiKey(apiKey) {
      // Mock validation
      await new Promise((resolve) => setTimeout(resolve, 500));
      return apiKey.length > 20;
    },
  },
  anthropic: {
    name: "Anthropic",
    models: ["claude-3-opus", "claude-3-sonnet"],
    supportsAttachments: true,
    supportsStreaming: true,

    async generateCompletion(request) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        text: `This is a mock response from Anthropic for: "${request.prompt}"`,
        model: "claude-3-opus",
        executionTime: 1500,
      };
    },

    async validateApiKey(apiKey) {
      // Mock validation
      await new Promise((resolve) => setTimeout(resolve, 500));
      return apiKey.startsWith("sk-ant-");
    },
  },
  gemini: {
    name: "Google Gemini",
    models: ["gemini-pro", "gemini-pro-vision"],
    supportsAttachments: true,
    supportsStreaming: false,

    async generateCompletion(request) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        text: `This is a mock response from Gemini for: "${request.prompt}"`,
        model: "gemini-pro",
        executionTime: 1500,
      };
    },

    async validateApiKey(apiKey) {
      // Mock validation
      await new Promise((resolve) => setTimeout(resolve, 500));
      return apiKey.length > 10;
    },
  },
  deepseek: {
    name: "DeepSeek",
    models: ["deepseek-coder"],
    supportsAttachments: false,
    supportsStreaming: true,

    async generateCompletion(request) {
      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return {
        text: `This is a mock response from DeepSeek for: "${request.prompt}"`,
        model: "deepseek-coder",
        executionTime: 1500,
      };
    },

    async validateApiKey(apiKey) {
      // Mock validation
      await new Promise((resolve) => setTimeout(resolve, 500));
      return apiKey.length > 15;
    },
  },
};

/**
 * Get a client for the specified service
 * Currently returns mock implementations, will be replaced with real implementations
 * when we implement the actual API clients
 */
export function getAIClient(service: ServiceName): AIClient {
  return mockClients[service];

  // Later we'll change this to return real implementations:
  // switch (service) {
  //   case "openai":
  //     return new OpenAIClient();
  //   case "anthropic":
  //     return new AnthropicClient();
  //   case "gemini":
  //     return new GeminiClient();
  //   case "deepseek":
  //     return new DeepSeekClient();
  //   default:
  //     throw new Error(`Unsupported AI service: ${service}`);
  // }
}

/**
 * Get all available AI clients
 */
export function getAllAIClients(): Record<ServiceName, AIClient> {
  return mockClients;

  // Later we'll change this to return real implementations:
  // return {
  //   openai: new OpenAIClient(),
  //   anthropic: new AnthropicClient(),
  //   gemini: new GeminiClient(),
  //   deepseek: new DeepSeekClient(),
  // };
}
