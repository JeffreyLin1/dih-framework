/**
 * Model interface for DIH Framework
 * Defines the contract for all AI model implementations
 */

export interface ModelOptions {
  apiKey?: string;
  modelName?: string;
  maxTokens?: number;
  temperature?: number;
  basePath?: string;
}

export interface CompletionRequest {
  messages: Array<{
    role: string;
    content: string;
    name?: string;
  }>;
  stream?: boolean;
  maxTokens?: number;
  temperature?: number;
  tools?: any[];
  toolChoice?: string | { type: string, function?: { name: string } };
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: any[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ModelInterface {
  /**
   * Initialize the model
   */
  init(): Promise<void>;
  
  /**
   * Update model configuration
   */
  updateConfig(options: ModelOptions): void;
  
  /**
   * Get the model name
   */
  getModelName(): string;
  
  /**
   * Create a completion
   */
  createCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  
  /**
   * Create a streaming completion
   */
  createStreamingCompletion(
    request: CompletionRequest,
    onChunk: (chunk: any) => void,
    onComplete: (fullResponse: CompletionResponse) => void,
    onError: (error: Error) => void
  ): Promise<void>;
  
  /**
   * Count tokens for a given input
   */
  countTokens(input: string): Promise<number>;
} 