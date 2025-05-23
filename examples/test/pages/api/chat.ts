import { NextApiRequest, NextApiResponse } from 'next';
import { getDIH } from '../../lib/dih';
import { ChatMessage } from '@tr1jeffrey/dih';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { messages } = req.body as { messages: ChatMessage[] };
  
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required' });
  }
  
  try {
    const dih = await getDIH();
    const model = dih.getModel();
    
    const response = await model.createCompletion({
      messages,
      temperature: 0.7,
      maxTokens: 500
    });
    
    return res.status(200).json({
      content: response.choices[0].message.content,
      finishReason: response.choices[0].finish_reason,
      usage: response.usage
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred'
    });
  }
} 