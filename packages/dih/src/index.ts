/**
 * DIH Framework
 * A framework for building AI-powered applications
 */

export interface DIHConfig {
  apiKey?: string;
  modelName?: string;
  maxTokens?: number;
}

export class DIH {
  private config: DIHConfig;

  constructor(config: DIHConfig = {}) {
    this.config = {
      modelName: 'gpt-4',
      maxTokens: 1000,
      ...config
    };
  }

  /**
   * Initialize the DIH framework
   */
  async init(): Promise<void> {
    console.log('DIH Framework initialized with config:', this.config);
  }
}

// Default export
export default DIH; 