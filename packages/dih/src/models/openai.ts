/**
 * OpenAI model implementation for DIH Framework
 */
import { ModelInterface, ModelOptions, CompletionRequest, CompletionResponse } from './interface.js';

export class OpenAIModel implements ModelInterface {
  private apiKey: string | undefined;
  private modelName: string;
  private maxTokens: number;
  private temperature: number;
  private basePath: string | undefined;
  private initialized: boolean = false;

  constructor(options: ModelOptions = {}) {
    this.apiKey = options.apiKey;
    this.modelName = options.modelName || 'gpt-3.5-turbo';
    this.maxTokens = options.maxTokens || 1000;
    this.temperature = options.temperature !== undefined ? options.temperature : 0.7;
    this.basePath = options.basePath;
  }

  async init(): Promise<void> {
    if (!this.apiKey) {
      const envApiKey = process.env.OPENAI_API_KEY;
      if (!envApiKey) {
        throw new Error('OpenAI API key is required. Set it in the options or as OPENAI_API_KEY environment variable.');
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

    const url = this.basePath || 'https://api.openai.com/v1/chat/completions';
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const body: Record<string, any> = {
      model: this.modelName,
      messages: request.messages,
      max_tokens: request.maxTokens || this.maxTokens,
      temperature: request.temperature !== undefined ? request.temperature : this.temperature,
      stream: false
    };

    if (request.tools) {
      body.tools = request.tools;
    }

    if (request.toolChoice) {
      body.tool_choice = request.toolChoice;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
      }

      return await response.json() as CompletionResponse;
    } catch (error) {
      throw new Error(`OpenAI completion error: ${(error as Error).message}`);
    }
  }

  async createStreamingCompletion(
    request: CompletionRequest,
    onChunk: (chunk: any) => void,
    onComplete: (fullResponse: CompletionResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    this.ensureInitialized();

    const url = this.basePath || 'https://api.openai.com/v1/chat/completions';
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const body: Record<string, any> = {
      model: this.modelName,
      messages: request.messages,
      max_tokens: request.maxTokens || this.maxTokens,
      temperature: request.temperature !== undefined ? request.temperature : this.temperature,
      stream: true
    };

    if (request.tools) {
      body.tools = request.tools;
    }

    if (request.toolChoice) {
      body.tool_choice = request.toolChoice;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
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
        choices: []
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
              this.updateFullResponse(fullResponse, chunk);
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
    // Implement token counting logic or use a library like tiktoken
    // For now, this is a very basic approximation (not accurate)
    const words = input.trim().split(/\s+/).length;
    return Math.ceil(words * 1.3); // Rough approximation
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('OpenAI model is not initialized. Call init() first.');
    }
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required.');
    }
  }

  private updateFullResponse(fullResponse: any, chunk: any): void {
    if (!fullResponse.id && chunk.id) {
      fullResponse.id = chunk.id;
    }
    
    if (chunk.choices && chunk.choices.length > 0) {
      const choice = chunk.choices[0];
      const index = choice.index || 0;
      
      if (!fullResponse.choices[index]) {
        fullResponse.choices[index] = {
          index,
          message: {
            role: 'assistant',
            content: ''
          },
          finish_reason: null
        };
      }
      
      if (choice.delta.content) {
        fullResponse.choices[index].message.content += choice.delta.content;
      }
      
      if (choice.delta.role) {
        fullResponse.choices[index].message.role = choice.delta.role;
      }
      
      if (choice.finish_reason) {
        fullResponse.choices[index].finish_reason = choice.finish_reason;
      }
      
      if (choice.delta.tool_calls) {
        if (!fullResponse.choices[index].message.tool_calls) {
          fullResponse.choices[index].message.tool_calls = [];
        }
        
        choice.delta.tool_calls.forEach((toolCall: any, i: number) => {
          if (!fullResponse.choices[index].message.tool_calls[i]) {
            fullResponse.choices[index].message.tool_calls[i] = {
              index: i,
              id: toolCall.id || '',
              type: toolCall.type || 'function',
              function: { name: '', arguments: '' }
            };
          }
          
          if (toolCall.function) {
            if (toolCall.function.name) {
              fullResponse.choices[index].message.tool_calls[i].function.name = toolCall.function.name;
            }
            
            if (toolCall.function.arguments) {
              fullResponse.choices[index].message.tool_calls[i].function.arguments += toolCall.function.arguments;
            }
          }
        });
      }
    }
  }
} 