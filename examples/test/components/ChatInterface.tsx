import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/ChatInterface.module.css';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  initialMessages?: Message[];
  systemMessage?: string;
  onSendMessage: (messages: Message[]) => Promise<string>;
  placeholder?: string;
}

export default function ChatInterface({
  initialMessages = [],
  systemMessage = 'You are a helpful assistant.',
  onSendMessage,
  placeholder = 'Type your message here...'
}: ChatInterfaceProps) {
  // Initialize with system message and any initial messages
  const [messages, setMessages] = useState<Message[]>(() => {
    const msgs: Message[] = [{ role: 'system', content: systemMessage }];
    return [...msgs, ...initialMessages];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const allMessages = [...messages, userMessage].filter(m => m.role !== 'system' || messages.indexOf(m) === 0);
      const response = await onSendMessage(allMessages);
      
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, an error occurred. Please try again.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className={styles.chatContainer}>
      <div className={styles.messageContainer}>
        {messages.filter(m => m.role !== 'system').map((message, index) => (
          <div 
            key={index}
            className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}
          >
            <div className={styles.messageContent}>{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.loader}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={styles.inputContainer}>
        <textarea
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
        />
        <button 
          className={styles.sendButton}
          onClick={handleSend}
          disabled={isLoading || input.trim() === ''}
        >
          Send
        </button>
      </div>
    </div>
  );
} 