import { NextApiRequest, NextApiResponse } from 'next';
import { getDIH } from '../../lib/dih';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { query, tools } = req.body;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  try {
    const dih = await getDIH();
    const model = dih.getModel();
    
    // Process the query with function calling ability
    const response = await model.createCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant that can use tools.' },
        { role: 'user', content: query }
      ],
      tools: tools || [],
      temperature: 0.7
    });
    
    // Check if the model wants to call functions
    const message = response.choices[0].message;
    
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Return the tool calls for client-side execution
      return res.status(200).json({
        toolCalls: message.tool_calls
      });
    }
    
    // Return the regular content response
    return res.status(200).json({
      content: message.content
    });
  } catch (error: any) {
    console.error('Error in process-query API:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred'
    });
  }
} 