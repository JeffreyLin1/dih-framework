import React, { useState } from 'react';
import Head from 'next/head';
import ToolPanel from '../components/ToolPanel';
import styles from '../styles/Tools.module.css';

// Define available tools
const availableTools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get the current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city and state, e.g., San Francisco, CA'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: 'The unit of temperature'
          }
        },
        required: ['location']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search for products in the catalog',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query'
          },
          category: {
            type: 'string',
            description: 'The product category'
          },
          max_results: {
            type: 'integer',
            description: 'Maximum number of results to return'
          }
        },
        required: ['query']
      }
    }
  }
];

export default function ToolsPage() {
  const [loading, setLoading] = useState(false);
  
  // Handler for executing a query that might use tools
  const handleExecute = async (query: string) => {
    setLoading(true);
    try {
      // Call the API to process the query
      const response = await fetch('/api/process-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          tools: availableTools
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process query');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        content: `Error: ${(error as Error).message}`
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Mock implementation of tool execution
  const handleToolExecution = async (toolName: string, args: Record<string, any>): Promise<string> => {
    // In a real application, these would call actual services
    switch (toolName) {
      case 'get_weather':
        return getWeatherMock(args.location, args.unit);
      case 'search_products':
        return searchProductsMock(args.query, args.category, args.max_results);
      default:
        return `Unknown tool: ${toolName}`;
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>AI Tools with DIH 🥀</title>
        <meta name="description" content="Tools example with DIH 🥀" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>
          AI Tools with DIH 🥀
        </h1>
        
        <p className={styles.description}>
          This example demonstrates using DIH 🥀 with tools. Try asking about the weather or searching for products.
        </p>
        
        <div className={styles.toolWrapper}>
          <ToolPanel 
            availableTools={availableTools}
            onExecute={handleExecute}
            onToolExecution={handleToolExecution}
          />
        </div>
        
        <div className={styles.examples}>
          <h2>Example Queries</h2>
          <ul>
            <li>What's the weather like in New York?</li>
            <li>Search for wireless headphones</li>
            <li>Find me red shoes in the footwear category</li>
          </ul>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <a
          href="https://github.com/jeffreylin1/dih-framework"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by DIH 🥀
        </a>
      </footer>
    </div>
  );
}

// Mock functions for tool execution
function getWeatherMock(location: string, unit: string = 'celsius'): string {
  const temp = Math.floor(Math.random() * 30);
  const conditions = ['sunny', 'cloudy', 'rainy', 'windy'][Math.floor(Math.random() * 4)];
  
  return JSON.stringify({
    location,
    temperature: unit === 'fahrenheit' ? temp * 9/5 + 32 : temp,
    unit,
    conditions,
    humidity: Math.floor(Math.random() * 100),
    forecast: 'This is a mock weather forecast.',
    timestamp: new Date().toISOString()
  });
}

function searchProductsMock(query: string, category?: string, maxResults: number = 5): string {
  const products = [
    { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 79.99 },
    { id: 2, name: 'Running Shoes', category: 'Footwear', price: 89.99 },
    { id: 3, name: 'Smart Watch', category: 'Electronics', price: 199.99 },
    { id: 4, name: 'Backpack', category: 'Accessories', price: 49.99 },
    { id: 5, name: 'Water Bottle', category: 'Sports', price: 19.99 },
    { id: 6, name: 'Yoga Mat', category: 'Sports', price: 29.99 },
    { id: 7, name: 'Bluetooth Speaker', category: 'Electronics', price: 59.99 },
    { id: 8, name: 'Running Shorts', category: 'Clothing', price: 34.99 },
    { id: 9, name: 'Dress Shoes', category: 'Footwear', price: 129.99 },
    { id: 10, name: 'Red Sneakers', category: 'Footwear', price: 69.99 },
  ];
  
  // Filter products based on query and category
  let results = products.filter(product => 
    product.name.toLowerCase().includes(query.toLowerCase()) || 
    product.category.toLowerCase().includes(query.toLowerCase())
  );
  
  if (category) {
    results = results.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Limit results
  results = results.slice(0, maxResults);
  
  return JSON.stringify({
    query,
    category,
    total_results: results.length,
    products: results
  });
} 