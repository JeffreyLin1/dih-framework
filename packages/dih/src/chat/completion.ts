/**
 * Chat completion module for DIH Framework
 */
import { ModelInterface } from '../models/interface.js';
import { StreamingHandler } from '../streaming/handler.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string;
  name?: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: Array<{
    type: string;
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    }
  }>;
  toolChoice?: string | { type: string, function?: { name: string } };
}

export class ChatCompletion {
  private model: ModelInterface;
  
  constructor(model: ModelInterface) {
    this.model = model;
  }
  
  /**
   * Generate a chat completion
   */
  async generate(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<{ text: string, finishReason: string }> {
    const response = await this.model.createCompletion({
      messages,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      tools: options.tools,
      toolChoice: options.toolChoice,
      stream: false
    });
    
    const message = response.choices[0]?.message;
    
    return {
      text: message.content || '',
      finishReason: response.choices[0]?.finish_reason || 'unknown'
    };
  }
  
  /**
   * Generate a streaming chat completion
   */
  async generateStream(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {},
    handler: StreamingHandler
  ): Promise<void> {
    await this.model.createStreamingCompletion(
      {
        messages,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        tools: options.tools,
        toolChoice: options.toolChoice,
        stream: true
      },
      (chunk) => handler.onChunk(chunk),
      (fullResponse) => handler.onComplete(fullResponse),
      (error) => handler.onError(error)
    );
  }
  
  /**
   * Switch to a different model
   */
  setModel(model: ModelInterface): void {
    this.model = model;
  }
  
  /**
   * Get current model
   */
  getModel(): ModelInterface {
    return this.model;
  }
} 