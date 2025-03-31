import { AIClient, AIRequest, AIResponse, ServiceName } from "./types";
import { getAIClient } from "./clientFactory";

/**
 * Status of a concurrent request
 */
export type RequestStatus = 'idle' | 'loading' | 'streaming' | 'success' | 'error';

/**
 * Request state for tracking purposes
 */
export interface RequestState {
  service: ServiceName;
  model: string;
  status: RequestStatus;
  progress: number;
  response?: AIResponse;
  error?: string;
}

/**
 * Options for concurrent requests
 */
export interface ConcurrentRequestOptions {
  onStatusChange?: (service: ServiceName, status: RequestStatus) => void;
  onProgress?: (service: ServiceName, progress: number) => void;
  onStreamChunk?: (service: ServiceName, text: string, isComplete: boolean) => void;
  onResponse?: (service: ServiceName, response: AIResponse) => void;
  onError?: (service: ServiceName, error: string) => void;
}

/**
 * Manage concurrent requests to multiple AI services
 */
export class ConcurrentRequests {
  private requestStates: Map<ServiceName, RequestState> = new Map();
  private options: ConcurrentRequestOptions;

  constructor(options: ConcurrentRequestOptions = {}) {
    this.options = options;
  }

  /**
   * Get the current state of all requests
   */
  getRequestStates(): Map<ServiceName, RequestState> {
    return this.requestStates;
  }

  /**
   * Send a prompt to multiple AI services concurrently
   */
  async sendToMultipleServices(
    services: ServiceName[], 
    request: AIRequest
  ): Promise<Map<ServiceName, AIResponse>> {
    // Initialize request states
    services.forEach(service => {
      const model = request.options?.modelId || getAIClient(service).models[0];
      this.requestStates.set(service, {
        service,
        model,
        status: 'idle',
        progress: 0
      });
    });

    // Create a promise for each service
    const promises = services.map(service => this.sendToService(service, request));
    
    // Wait for all requests to complete
    const results = await Promise.allSettled(promises);
    
    // Process results
    const responses = new Map<ServiceName, AIResponse>();
    
    results.forEach((result, index) => {
      const service = services[index];
      
      if (result.status === 'fulfilled') {
        responses.set(service, result.value);
      } else {
        // For rejected promises, store an error response
        const errorResponse: AIResponse = {
          text: '',
          model: this.requestStates.get(service)?.model || 'unknown',
          executionTime: 0,
          error: result.reason?.message || 'Unknown error'
        };
        responses.set(service, errorResponse);
      }
    });
    
    return responses;
  }

  /**
   * Send a prompt to a single AI service
   */
  private async sendToService(service: ServiceName, request: AIRequest): Promise<AIResponse> {
    const client = getAIClient(service);
    
    // Update state to loading
    this.updateRequestState(service, {
      status: 'loading',
      progress: 0
    });
    
    try {
      // If streaming is supported and enabled, use streaming API
      if (client.supportsStreaming && request.options?.stream !== false && client.generateStreamingCompletion) {
        // Update state to streaming
        this.updateRequestState(service, {
          status: 'streaming',
          progress: 0
        });
        
        return await this.handleStreamingRequest(service, client, request);
      } else {
        // Use regular completion API
        const response = await client.generateCompletion(request);
        
        // Update state to success
        this.updateRequestState(service, {
          status: 'success',
          progress: 100,
          response
        });
        
        // Trigger onResponse callback
        this.options.onResponse?.(service, response);
        
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Update state to error
      this.updateRequestState(service, {
        status: 'error',
        progress: 0,
        error: errorMessage
      });
      
      // Trigger onError callback
      this.options.onError?.(service, errorMessage);
      
      // Re-throw to be caught by caller
      throw error;
    }
  }

  /**
   * Handle a streaming request
   */
  private async handleStreamingRequest(
    service: ServiceName, 
    client: AIClient, 
    request: AIRequest
  ): Promise<AIResponse> {
    const startTime = Date.now();
    let fullText = '';
    
    return new Promise<AIResponse>((resolve, reject) => {
      client.generateStreamingCompletion?.(
        request,
        (chunk) => {
          // Append to full text
          fullText += chunk.text;
          
          // Calculate progress (approximate)
          // This is a naive implementation - in reality, we don't know the total length in advance
          const progress = chunk.isComplete ? 100 : Math.min(95, (fullText.length / 500) * 100);
          
          // Update state
          this.updateRequestState(service, {
            progress
          });
          
          // Trigger callbacks
          this.options.onProgress?.(service, progress);
          this.options.onStreamChunk?.(service, chunk.text, chunk.isComplete);
          
          // If complete, resolve with final response
          if (chunk.isComplete) {
            const endTime = Date.now();
            const executionTime = endTime - startTime;
            
            const response: AIResponse = {
              text: fullText,
              model: request.options?.modelId || client.models[0],
              executionTime
            };
            
            // Update state to success
            this.updateRequestState(service, {
              status: 'success',
              progress: 100,
              response
            });
            
            // Trigger onResponse callback
            this.options.onResponse?.(service, response);
            
            resolve(response);
          }
        }
      ).catch(error => {
        reject(error);
      });
    });
  }

  /**
   * Update the state of a request
   */
  private updateRequestState(service: ServiceName, updates: Partial<RequestState>) {
    const currentState = this.requestStates.get(service);
    
    if (!currentState) {
      return;
    }
    
    const newState = { ...currentState, ...updates };
    this.requestStates.set(service, newState);
    
    // Trigger status change callback if status changed
    if (updates.status && updates.status !== currentState.status) {
      this.options.onStatusChange?.(service, updates.status);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAll() {
    // Note: This doesn't actually cancel the in-flight network requests
    // That would require AbortController support in the client implementations
    // This just updates the state to reflect cancellation
    for (const [service, state] of this.requestStates.entries()) {
      if (state.status === 'loading' || state.status === 'streaming') {
        this.updateRequestState(service, {
          status: 'error',
          error: 'Request cancelled'
        });
      }
    }
  }
} 