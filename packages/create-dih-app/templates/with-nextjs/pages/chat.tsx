import React, { useState } from 'react';
import Head from 'next/head';
import ChatInterface from '../components/ChatInterface';
import styles from '../styles/Chat.module.css';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [loading, setLoading] = useState(false);
  
  const handleSendMessage = async (messages: Message[]): Promise<string> => {
    setLoading(true);
    try {
      // Filter out any system messages except the first one
      const messagesToSend = messages.filter(
        (m, i, arr) => m.role !== 'system' || arr.indexOf(m) === 0
      );
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: messagesToSend }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }
      
      return data.content;
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, an error occurred. Please try again.';
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Chat with DIH Framework</title>
        <meta name="description" content="Chat example with DIH Framework" />
      </Head>
      
      <main className={styles.main}>
        <h1 className={styles.title}>
          Chat with DIH Framework
        </h1>
        
        <p className={styles.description}>
          This example demonstrates a chat interface using DIH Framework
        </p>
        
        <div className={styles.chatWrapper}>
          <ChatInterface
            systemMessage="You are a helpful assistant powered by DIH Framework. You are knowledgeable, friendly, and provide concise responses."
            onSendMessage={handleSendMessage}
            placeholder="Ask something..."
          />
        </div>
      </main>
      
      <footer className={styles.footer}>
        <a
          href="https://github.com/jeffreylin1/dih-framework"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by DIH Framework
        </a>
      </footer>
    </div>
  );
} 