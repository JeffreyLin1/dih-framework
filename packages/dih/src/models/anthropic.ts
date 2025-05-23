/**
 * Anthropic model implementation for DIH Framework
 */
import { ModelInterface, ModelOptions, CompletionRequest, CompletionResponse } from './interface.js';

export class AnthropicModel implements ModelInterface {
  private apiKey: string | undefined;
  private modelName: string;
  private maxTokens: number;
  private temperature: number;
  private basePath: string | undefined;
  private initialized: boolean = false;

  constructor(options: ModelOptions = {}) {
    this.apiKey = options.apiKey;
    this.modelName = options.modelName || 'claude-3-opus-20240229';
    this.maxTokens = options.maxTokens || 1000;
    this.temperature = options.temperature !== undefined ? options.temperature : 0.7;
    this.basePath = options.basePath;
  }

  async init(): Promise<void> {
    if (!this.apiKey) {
      const envApiKey = process.env.ANTHROPIC_API_KEY;
      if (!envApiKey) {
        throw new Error('Anthropic API key is required. Set it in the options or as ANTHROPIC_API_KEY environment variable.');
      }
      this.apiKey = envApiKey;
    }
    
    this.initialized = true;
  }

  updateConfig(options: ModelOptions): void {
    if (options.apiKey) this.apiKey = options.apiKey;
    if (options.modelName) this.modelName = options.modelName;
    if (options.maxTokens) this.maxTokens = options.maxTokens;
    if (options.temperature !== undefined) this.temperature = options.temperature;
    if (options.basePath) this.basePath = options.basePath;
  }

  getModelName(): string {
    return this.modelName;
  }

  async createCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    this.ensureInitialized();

    const url = this.basePath || 'https://api.anthropic.com/v1/messages';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    };
    
    // Add API key only if it exists (it should at this point)
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    // Transform messages to Anthropic format if needed
    const messages = request.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const body: Record<string, any> = {
      model: this.modelName,
      messages,
      max_tokens: request.maxTokens || this.maxTokens,
      temperature: request.temperature !== undefined ? request.temperature : this.temperature,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${errorData}`);
      }

      const anthropicResponse = await response.json();
      
      // Transform Anthropic response to standard completion response format
      return {
        id: anthropicResponse.id,
        object: 'chat.completion',
        created: Date.now(),
        model: this.modelName,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: anthropicResponse.content[0].text
          },
          finish_reason: anthropicResponse.stop_reason || 'stop'
        }],
        usage: anthropicResponse.usage ? {
          prompt_tokens: anthropicResponse.usage.input_tokens,
          completion_tokens: anthropicResponse.usage.output_tokens,
          total_tokens: anthropicResponse.usage.input_tokens + anthropicResponse.usage.output_tokens
        } : undefined
      };
    } catch (error) {
      throw new Error(`Anthropic completion error: ${(error as Error).message}`);
    }
  }

  async createStreamingCompletion(
    request: CompletionRequest,
    onChunk: (chunk: any) => void,
    onComplete: (fullResponse: CompletionResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    this.ensureInitialized();

    const url = this.basePath || 'https://api.anthropic.com/v1/messages';
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    };
    
    // Add API key only if it exists (it should at this point)
    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    }

    // Transform messages to Anthropic format
    const messages = request.messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const body: Record<string, any> = {
      model: this.modelName,
      messages,
      max_tokens: request.maxTokens || this.maxTokens,
      temperature: request.temperature !== undefined ? request.temperature : this.temperature,
      stream: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Anthropic API error: ${response.status} ${errorData}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullResponse: any = {
        id: '',
        object: 'chat.completion',
        created: Date.now(),
        model: this.modelName,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: ''
          },
          finish_reason: null
        }]
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data.trim() === '[DONE]') {
              onComplete(fullResponse);
              return;
            }

            try {
              const chunk = JSON.parse(data);
              onChunk(chunk);
              
              // Update the full response with chunk data
              if (chunk.type === 'content_block_delta' && chunk.delta.text) {
                fullResponse.choices[0].message.content += chunk.delta.text;
              }
              
              if (chunk.message_id && !fullResponse.id) {
                fullResponse.id = chunk.message_id;
              }
              
              if (chunk.type === 'message_stop') {
                fullResponse.choices[0].finish_reason = 'stop';
              }
              
            } catch (e) {
              // Ignore invalid JSON
            }
          }
        }
      }
      
      onComplete(fullResponse);
    } catch (error) {
      onError(error as Error);
    }
  }

  async countTokens(input: string): Promise<number> {
    // Implement token counting logic or use a library like @anthropic-ai/tokenizer
    // For now, this is a very basic approximation (not accurate)
    const words = input.trim().split(/\s+/).length;
    return Math.ceil(words * 1.3); // Rough approximation
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Anthropic model is not initialized. Call init() first.');
    }
    
    if (!this.apiKey) {
      throw new Error('Anthropic API key is required.');
    }
  }
} 