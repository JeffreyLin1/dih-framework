/**
 * Token counting utilities for DIH Framework
 */

/**
 * Roughly estimate the number of tokens in a string.
 * This is a very simple approximation used when more accurate tokenizers are not available.
 * 
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  // Very rough approximation: count words and add padding
  // For more accurate counting, libraries like tiktoken or gpt-tokenizer should be used
  if (!text) return 0;
  
  // Split by whitespace and filter out empty strings
  const words = text.split(/\s+/).filter(Boolean).length;
  
  // Count punctuation and special characters, which can be separate tokens
  const specialChars = (text.match(/[^\w\s]/g) || []).length;
  
  // Very rough formula: 4 characters ≈ 1 token on average
  // But we add padding to account for tokenization
  return Math.ceil(words * 1.3) + Math.ceil(specialChars * 0.5);
}

/**
 * Convert token count to an approximate character count
 * 
 * @param tokens - Number of tokens
 * @returns Estimated character count
 */
export function tokensToChars(tokens: number): number {
  // On average, 1 token ≈ 4 characters
  return tokens * 4;
}

/**
 * Estimate the cost of a prompt based on token count and model
 * 
 * @param promptTokens - Number of tokens in the prompt
 * @param completionTokens - Number of tokens in the completion
 * @param model - Model name (default: gpt-3.5-turbo)
 * @returns Estimated cost in USD
 */
export function estimateCost(
  promptTokens: number,
  completionTokens: number,
  model: string = 'gpt-3.5-turbo'
): number {
  // Default pricing for common models (as of early 2024)
  // These should be updated as pricing changes
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    'gpt-4': { prompt: 0.03, completion: 0.06 },
    'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
    'claude-3-opus': { prompt: 0.015, completion: 0.075 },
    'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
    'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
  };
  
  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  
  // Calculate cost per 1000 tokens
  const promptCost = (promptTokens / 1000) * modelPricing.prompt;
  const completionCost = (completionTokens / 1000) * modelPricing.completion;
  
  return promptCost + completionCost;
}

/**
 * Truncate a text to fit within a specified token limit
 * 
 * @param text - The text to truncate
 * @param maxTokens - Maximum number of tokens
 * @param suffix - Optional suffix to add when truncated (e.g., "...")
 * @returns Truncated text
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  suffix: string = '...'
): string {
  const estimatedTokens = estimateTokenCount(text);
  
  if (estimatedTokens <= maxTokens) {
    return text;
  }
  
  // Very rough approximation for truncation point
  const approxCharsPerToken = 4;
  const suffixTokens = estimateTokenCount(suffix);
  const targetTokens = maxTokens - suffixTokens;
  
  if (targetTokens <= 0) {
    return suffix;
  }
  
  const targetChars = Math.floor(targetTokens * approxCharsPerToken);
  
  // Truncate to aproximate character length, then trim to word boundary
  let truncated = text.slice(0, targetChars);
  truncated = truncated.replace(/\s+\S*$/, '');
  
  return truncated + suffix;
} 