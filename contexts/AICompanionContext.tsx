import React, { createContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AIMessage } from '@/types';
import { aiService } from '@/services/aiService';

interface AICompanionContextType {
  messages: AIMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearConversation: () => Promise<void>;
}

export const AICompanionContext = createContext<AICompanionContextType | undefined>(undefined);

export function AICompanionProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem('ai_messages');
      if (stored) {
        const parsedMessages = JSON.parse(stored).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } else {
        // Add welcome message if no conversation exists
        await addWelcomeMessage();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Initialize with welcome message on error
      await addWelcomeMessage();
    }
  };

  const saveMessages = async (newMessages: AIMessage[]) => {
    try {
      await AsyncStorage.setItem('ai_messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const addWelcomeMessage = async () => {
    try {
      const welcomeMessage: AIMessage = {
        id: 'welcome_' + Date.now(),
        content: "Hello! I'm your AI wellness companion. I'm here to support you on your mental health journey. How are you feeling today?",
        timestamp: new Date(),
        isUser: false,
        emotion: 'welcoming'
      };
      
      const newMessages = [welcomeMessage];
      setMessages(newMessages);
      await saveMessages(newMessages);
    } catch (error) {
      console.error('Error adding welcome message:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    try {
      // Check for crisis keywords
      if (aiService.detectCrisis(content)) {
        console.log('Crisis detected - would trigger emergency protocols');
      }

      const userMessage: AIMessage = {
        id: 'user_' + Date.now(),
        content: content.trim(),
        timestamp: new Date(),
        isUser: true
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      
      setIsTyping(true);
      
      try {
        const contextMessages = messages
          .filter(msg => msg.isUser)
          .slice(-3) // Last 3 user messages for context
          .map(msg => msg.content);
        
                const response = await aiService.generateResponse(content, messages.slice(-3));
        
        const aiMessage: AIMessage = {
          id: 'ai_' + Date.now(),
          content: response,
          timestamp: new Date(),
          isUser: false,
          emotion: 'supportive'
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        await saveMessages(finalMessages);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Add fallback message on API error
        const errorMessage: AIMessage = {
          id: 'error_' + Date.now(),
          content: "I understand you're reaching out. While I'm having some technical difficulties right now, please know that your feelings are valid and you're not alone. Would you like to try again, or is there something specific you'd like to talk about?",
          timestamp: new Date(),
          isUser: false,
          emotion: 'supportive'
        };

        const finalMessages = [...updatedMessages, errorMessage];
        setMessages(finalMessages);
        await saveMessages(finalMessages);
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = async () => {
    try {
      setMessages([]);
      await AsyncStorage.removeItem('ai_messages');
      await addWelcomeMessage();
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  return (
    <AICompanionContext.Provider value={{
      messages,
      isTyping,
      sendMessage,
      clearConversation
    }}>
      {children}
    </AICompanionContext.Provider>
  );
}