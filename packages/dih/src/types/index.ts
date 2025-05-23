/**
 * Common types for DIH Framework
 */

/**
 * Function call for tool usage
 */
export interface FunctionCall {
  name: string;
  arguments: string;
}

/**
 * Tool call structure
 */
export interface ToolCall {
  id: string;
  type: string;
  function: FunctionCall;
}

/**
 * Function definition for tools
 */
export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Tool definition
 */
export interface Tool {
  type: string;
  function: FunctionDefinition;
}

/**
 * Response format options
 */
export interface ResponseFormat {
  type: 'text' | 'json_object';
}

/**
 * Chat role type
 */
export type ChatRole = 'system' | 'user' | 'assistant' | 'function' | 'tool';

/**
 * Usage statistics
 */
export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Error response
 */
export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

/**
 * Model provider type
 */
export enum ModelProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  CUSTOM = 'custom'
}

/**
 * Function execution result
 */
export interface FunctionResult {
  name: string;
  content: string;
}

/**
 * Tool choice option
 */
export type ToolChoice = 'auto' | 'none' | { type: string; function: { name: string } }; 