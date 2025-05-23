/**
 * Core DIH framework class
 */
import { DIHConfig } from '../index.js';
import { Logger } from '../utils/logger.js';
import { ModelInterface } from '../models/interface.js';
import { OpenAIModel } from '../models/openai.js';

export class DIH {
  private config: DIHConfig;
  private logger: Logger;
  private model: ModelInterface;

  constructor(config: DIHConfig = {}) {
    this.config = {
      modelName: 'gpt-3.5-turbo',
      maxTokens: 1000,
      debug: false,
      ...config
    };
    
    this.logger = new Logger(this.config.debug || false);
    
    // Default to OpenAI model if not specified
    this.model = new OpenAIModel({
      apiKey: this.config.apiKey,
      modelName: this.config.modelName,
      maxTokens: this.config.maxTokens,
      temperature: 0.7,
      basePath: this.config.basePath
    });
  }

  /**
   * Initialize the DIH framework
   */
  async init(): Promise<void> {
    this.logger.info('DIH Framework initialized with config:', this.config);
    await this.model.init();
  }

  /**
   * Set a different model implementation
   */
  setModel(model: ModelInterface): void {
    this.model = model;
    this.logger.info('Model changed:', model.constructor.name);
  }

  /**
   * Get the current model instance
   */
  getModel(): ModelInterface {
    return this.model;
  }

  /**
   * Update framework configuration
   */
  updateConfig(config: Partial<DIHConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    
    // Update logger if debug setting changed
    if (config.debug !== undefined) {
      this.logger.setDebug(config.debug);
    }
    
    // Update model config if properties are changed
    this.model.updateConfig({
      apiKey: this.config.apiKey,
      modelName: this.config.modelName,
      maxTokens: this.config.maxTokens,
      basePath: this.config.basePath
    });

    this.logger.info('Config updated:', this.config);
  }
} 