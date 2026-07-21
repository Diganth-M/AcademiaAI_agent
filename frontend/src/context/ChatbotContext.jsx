import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatbotContext = createContext();

export const ChatbotProvider = ({ children }) => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [isChatFullScreen, setIsChatFullScreen] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContext, setCurrentContext] = useState(null); // { text: "...", title: "..." }
  const [usePageContext, setUsePageContext] = useState(true);
  const [autoReadAloud, setAutoReadAloud] = useState(() => {
    return localStorage.getItem('autoReadAloud') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('autoReadAloud', autoReadAloud);
  }, [autoReadAloud]);

  // Clear chat context when a new user logs in or user logs out
  useEffect(() => {
    setMessages([]);
    setActiveConversationId(null);
  }, [user?.id]);

  const openChat = () => {
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsChatMinimized(false);
    setIsChatFullScreen(false);
  };

  const toggleMinimize = () => {
    if (!isChatMinimized) {
      setIsChatFullScreen(false);
    }
    setIsChatMinimized(prev => !prev);
  };

  const toggleFullScreen = () => {
    setIsChatFullScreen(prev => !prev);
    setIsChatMinimized(false);
  };

  return (
    <ChatbotContext.Provider value={{
      isChatOpen, openChat, closeChat,
      isChatMinimized, toggleMinimize,
      isChatFullScreen, toggleFullScreen,
      messages, setMessages,
      activeConversationId, setActiveConversationId,
      isGenerating, setIsGenerating,
      currentContext, setCurrentContext,
      usePageContext, setUsePageContext,
      autoReadAloud, setAutoReadAloud
    }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => useContext(ChatbotContext);
