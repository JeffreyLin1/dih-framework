/**
 * Streaming handler for DIH Framework
 */
import { CompletionResponse } from '../models/interface.js';

export interface StreamingResponse {
  text: string;
  isDone: boolean;
  finishReason: string | null;
  toolCalls?: Array<{
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

/**
 * Base class for handling streaming responses from AI models
 */
export abstract class StreamingHandler {
  protected accumulated: string = '';
  protected toolCalls: Array<any> = [];
  protected isDone: boolean = false;
  protected finishReason: string | null = null;
  
  /**
   * Handle a chunk from the streaming response
   */
  abstract onChunk(chunk: any): void;
  
  /**
   * Handle the complete response once streaming is done
   */
  abstract onComplete(response: CompletionResponse): void;
  
  /**
   * Handle any errors that occur during streaming
   */
  abstract onError(error: Error): void;
  
  /**
   * Reset the handler state for a new streaming session
   */
  reset(): void {
    this.accumulated = '';
    this.toolCalls = [];
    this.isDone = false;
    this.finishReason = null;
  }

  /**
   * Get the current state of the streaming response
   */
  getResponse(): StreamingResponse {
    return {
      text: this.accumulated,
      isDone: this.isDone,
      finishReason: this.finishReason,
      toolCalls: this.toolCalls.length > 0 ? this.toolCalls : undefined
    };
  }
}

/**
 * Default implementation of StreamingHandler that provides callbacks for different events
 */
export class DefaultStreamingHandler extends StreamingHandler {
  private onTextCallback: (text: string) => void;
  private onChunkCallback?: (chunk: any) => void;
  private onCompleteCallback: (response: StreamingResponse) => void;
  private onErrorCallback: (error: Error) => void;
  
  constructor(
    onText: (text: string) => void,
    onComplete: (response: StreamingResponse) => void,
    onError: (error: Error) => void,
    onChunk?: (chunk: any) => void
  ) {
    super();
    this.onTextCallback = onText;
    this.onCompleteCallback = onComplete;
    this.onErrorCallback = onError;
    this.onChunkCallback = onChunk;
  }
  
  onChunk(chunk: any): void {
    if (this.onChunkCallback) {
      this.onChunkCallback(chunk);
    }
    
    // Handle OpenAI-like format
    if (chunk.choices && chunk.choices[0]?.delta) {
      const delta = chunk.choices[0].delta;
      
      if (delta.content) {
        this.accumulated += delta.content;
        this.onTextCallback(this.accumulated);
      }
      
      if (delta.tool_calls) {
        this.handleToolCalls(delta.tool_calls);
      }
      
      if (chunk.choices[0].finish_reason) {
        this.finishReason = chunk.choices[0].finish_reason;
        this.isDone = true;
      }
    }
    // Handle Anthropic-like format
    else if (chunk.type === 'content_block_delta' && chunk.delta.text) {
      this.accumulated += chunk.delta.text;
      this.onTextCallback(this.accumulated);
    }
    else if (chunk.type === 'message_stop') {
      this.isDone = true;
      this.finishReason = 'stop';
    }
  }
  
  onComplete(response: CompletionResponse): void {
    this.isDone = true;
    
    if (response.choices && response.choices[0]) {
      const content = response.choices[0].message.content;
      if (content !== null && !this.accumulated) {
        this.accumulated = content;
        this.onTextCallback(this.accumulated);
      }
      
      this.finishReason = response.choices[0].finish_reason;
      
      if (response.choices[0].message.tool_calls) {
        this.handleToolCalls(response.choices[0].message.tool_calls);
      }
    }
    
    this.onCompleteCallback(this.getResponse());
  }
  
  onError(error: Error): void {
    this.onErrorCallback(error);
  }
  
  private handleToolCalls(toolCalls: Array<any>): void {
    for (const toolCall of toolCalls) {
      const existingToolCall = this.toolCalls.find(tc => tc.id === toolCall.id);
      
      if (existingToolCall) {
        if (toolCall.function && toolCall.function.arguments) {
          existingToolCall.function.arguments += toolCall.function.arguments;
        }
      } else {
        this.toolCalls.push({
          id: toolCall.id,
          type: toolCall.type || 'function',
          function: {
            name: toolCall.function?.name || '',
            arguments: toolCall.function?.arguments || ''
          }
        });
      }
    }
  }
} 