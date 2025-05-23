import React, { useState } from 'react';
import styles from '../styles/ToolPanel.module.css';

interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  toolCall: ToolCall;
  result: string;
}

interface ToolPanelProps {
  availableTools: Tool[];
  onExecute: (query: string) => Promise<{
    toolCalls?: ToolCall[];
    content?: string;
  }>;
  onToolExecution?: (toolName: string, args: Record<string, any>) => Promise<string>;
}

export default function ToolPanel({
  availableTools,
  onExecute,
  onToolExecution
}: ToolPanelProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const handleExecute = async () => {
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    setResult(null);
    setError(null);
    setToolResults([]);
    
    try {
      const response = await onExecute(query);
      
      // Check if there are tool calls
      if (response.toolCalls && response.toolCalls.length > 0) {
        // Process each tool call
        for (const toolCall of response.toolCalls) {
          try {
            // Parse tool call arguments
            const args = JSON.parse(toolCall.function.arguments);
            let toolResult: string;
            
            // Execute the tool if onToolExecution is provided
            if (onToolExecution) {
              toolResult = await onToolExecution(toolCall.function.name, args);
            } else {
              toolResult = `Tool executed: ${toolCall.function.name} with args: ${JSON.stringify(args)}`;
            }
            
            // Add the tool result
            setToolResults(prev => [
              ...prev, 
              { toolCall, result: toolResult }
            ]);
          } catch (err) {
            console.error('Error processing tool call:', err);
            setToolResults(prev => [
              ...prev, 
              { 
                toolCall, 
                result: `Error: Could not process tool call: ${(err as Error).message}` 
              }
            ]);
          }
        }
      } else if (response.content) {
        // If no tool calls, but there's content, show it
        setResult(response.content);
      } else {
        // Fallback if neither tool calls nor content
        setResult('No tool calls or direct response received.');
      }
    } catch (err) {
      console.error('Error executing query:', err);
      setError((err as Error).message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={styles.toolPanel}>
      <div className={styles.toolHeader}>
        <h2>AI Tool Execution</h2>
        <p>Available tools: {availableTools.map(t => t.function.name).join(', ')}</p>
      </div>
      
      <div className={styles.querySection}>
        <textarea
          className={styles.queryInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query here..."
          disabled={isLoading}
          rows={3}
        />
        <button 
          className={styles.executeButton}
          onClick={handleExecute}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'Processing...' : 'Execute'}
        </button>
      </div>
      
      {error && (
        <div className={styles.errorBox}>
          Error: {error}
        </div>
      )}
      
      {toolResults.length > 0 && (
        <div className={styles.toolResults}>
          <h3>Tool Executions</h3>
          {toolResults.map((tr, index) => (
            <div key={index} className={styles.toolResult}>
              <div className={styles.toolCall}>
                <span className={styles.toolName}>{tr.toolCall.function.name}</span>
                <pre className={styles.toolArgs}>{tr.toolCall.function.arguments}</pre>
              </div>
              <div className={styles.resultOutput}>
                <h4>Result:</h4>
                <pre>{tr.result}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {result && (
        <div className={styles.resultContainer}>
          <h3>AI Response:</h3>
          <div className={styles.resultContent}>{result}</div>
        </div>
      )}
    </div>
  );
} 