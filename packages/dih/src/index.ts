/**
 * DIH Framework
 * A framework for building AI-powered applications
 */

// Configuration types
export interface DIHConfig {
  apiKey?: string;
  modelName?: string;
  maxTokens?: number;
  temperature?: number;
  basePath?: string;
  debug?: boolean;
}

// Core components
export { DIH } from './core/dih.js';

// Model interfaces
export { ModelInterface } from './models/interface.js';
export { OpenAIModel } from './models/openai.js';
export { AnthropicModel } from './models/anthropic.js';

// Chat completion
export { ChatMessage, ChatCompletionOptions, ChatCompletion } from './chat/completion.js';

// Prompt templates
export { PromptTemplate, TemplateVariable } from './prompt/template.js';

// Streaming
export { StreamingHandler, StreamingResponse } from './streaming/handler.js';

// Utilities
export { Logger } from './utils/logger.js';
export * from './utils/tokenCounter.js';

// Types
export * from './types/index.js'; 