import { useState, useCallback } from 'react';
import { useNotificationStore } from '../lib/store';
import type { AIMessage } from '../types/ai';

interface UseAIOptions {
  context?: string;
}

export function useAI({ context = 'visitor' }: UseAIOptions = {}) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: AIMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Call serverless function
      const response = await fetch('/.netlify/functions/openai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          content, 
          context,
          messages // Send conversation history
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Add AI response
      const assistantMessage: AIMessage = { 
        role: 'assistant', 
        content: data.response 
      };
      setMessages(prev => [...prev, assistantMessage]);

      return data.response;
    } catch (error) {
      console.error('AI error:', error);
      addNotification('Failed to get AI response. Please try again.', 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [context, messages, addNotification]);

  return {
    messages,
    sendMessage,
    isLoading
  };
}