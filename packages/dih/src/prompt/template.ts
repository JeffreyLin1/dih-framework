/**
 * Prompt template system for DIH Framework
 */

export interface TemplateVariable {
  name: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
}

/**
 * Template class for creating reusable prompt templates
 */
export class PromptTemplate {
  private template: string;
  private variables: TemplateVariable[];
  private delimiter: string;
  
  /**
   * Create a new prompt template
   * 
   * @param template - The template string with variables in the format {variable_name}
   * @param variables - Array of template variables with metadata
   * @param delimiter - The delimiter for variables (default: {})
   */
  constructor(
    template: string,
    variables: TemplateVariable[] = [],
    delimiter: string = '{}'
  ) {
    this.template = template;
    this.variables = variables;
    this.delimiter = delimiter;
  }
  
  /**
   * Format the template with the provided variables
   * 
   * @param values - Object mapping variable names to values
   * @returns The formatted prompt string
   */
  format(values: Record<string, string> = {}): string {
    let result = this.template;
    const startDelim = this.delimiter.charAt(0);
    const endDelim = this.delimiter.charAt(1) || this.delimiter.charAt(0);
    
    // Check for required variables
    for (const variable of this.variables) {
      if (variable.required && !values[variable.name] && variable.defaultValue === undefined) {
        throw new Error(`Required variable ${variable.name} is missing`);
      }
    }
    
    // Replace all variables in the template
    for (const variable of this.variables) {
      const regex = new RegExp(`${startDelim}${variable.name}${endDelim}`, 'g');
      const value = values[variable.name] !== undefined 
        ? values[variable.name] 
        : variable.defaultValue || '';
        
      result = result.replace(regex, value);
    }
    
    // Also replace any variables that weren't defined in the variables list
    const varPattern = new RegExp(`${startDelim}([a-zA-Z0-9_]+)${endDelim}`, 'g');
    result = result.replace(varPattern, (match, name) => {
      return values[name] !== undefined ? values[name] : match;
    });
    
    return result;
  }
  
  /**
   * Add a new variable to the template
   */
  addVariable(variable: TemplateVariable): void {
    this.variables.push(variable);
  }
  
  /**
   * Get all variables defined in the template
   */
  getVariables(): TemplateVariable[] {
    return [...this.variables];
  }
  
  /**
   * Extract all variable names used in the template
   */
  extractVariableNames(): string[] {
    const startDelim = this.delimiter.charAt(0);
    const endDelim = this.delimiter.charAt(1) || this.delimiter.charAt(0);
    const regex = new RegExp(`${startDelim}([a-zA-Z0-9_]+)${endDelim}`, 'g');
    const matches = this.template.matchAll(regex);
    const names = new Set<string>();
    
    for (const match of matches) {
      names.add(match[1]);
    }
    
    return Array.from(names);
  }
  
  /**
   * Create a chat message from the template
   */
  toChatMessage(role: string, values: Record<string, string> = {}): {
    role: string;
    content: string;
  } {
    return {
      role,
      content: this.format(values)
    };
  }
  
  /**
   * Static method to create system prompt template
   */
  static system(template: string, variables: TemplateVariable[] = []): PromptTemplate {
    return new PromptTemplate(template, variables);
  }
  
  /**
   * Static method to create user prompt template
   */
  static user(template: string, variables: TemplateVariable[] = []): PromptTemplate {
    return new PromptTemplate(template, variables);
  }
  
  /**
   * Static method to create assistant prompt template
   */
  static assistant(template: string, variables: TemplateVariable[] = []): PromptTemplate {
    return new PromptTemplate(template, variables);
  }
} 