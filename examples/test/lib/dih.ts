/**
 * DIH Framework configuration utility
 */
import { DIH } from '@tr1jeffrey/dih';

// Check if we're in a browser environment
const isClient = typeof window !== 'undefined';

// Environment variables are only available on the server in Next.js
// For client, we'll need to expose them via Next.js API routes
const getApiKey = () => {
  if (!isClient && process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  return undefined;
};

// Singleton pattern to maintain a single DIH instance
let dihInstance: DIH | null = null;

export async function getDIH(): Promise<DIH> {
  if (!dihInstance) {
    dihInstance = new DIH({
      apiKey: getApiKey(),
      modelName: process.env.DIH_MODEL_NAME || 'gpt-3.5-turbo',
      maxTokens: parseInt(process.env.DIH_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.DIH_TEMPERATURE || '0.7'),
      debug: process.env.NODE_ENV === 'development'
    });
    
    try {
      await dihInstance.init();
    } catch (error) {
      console.error('Error initializing DIH:', error);
      throw error;
    }
  }
  
  return dihInstance;
}

export function resetDIH() {
  dihInstance = null;
} 