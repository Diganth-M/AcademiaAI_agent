import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Maximize2, Minimize2, Minus, Send, Mic, Smile, StopCircle, RefreshCw } from 'lucide-react';
import './ChatbotPanel.css';

const SUGGESTIONS = [
  "Summarize this document",
  "Explain step by step",
  "Give real-life examples"
];

const ChatbotPanel = () => {
  const { 
    isChatOpen, isChatMinimized, isChatFullScreen, 
    closeChat, toggleMinimize, toggleFullScreen,
    messages, setMessages, activeConversationId, setActiveConversationId,
    usePageContext, setUsePageContext, currentContext 
  } = useChatbot();
  const { chatbotLanguage, updateChatbotLanguage } = useLanguage();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isChatOpen) return null;

  if (isChatMinimized) {
    return (
      <div className="chatbot-launcher-badge" onClick={toggleMinimize}>
        <Smile size={24} />
      </div>
    );
  }

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;
    
    stopGeneration();
    abortControllerRef.current = new AbortController();

    const userMsg = { role: 'USER', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: text,
          language: chatbotLanguage,
          pageContext: usePageContext && currentContext ? currentContext.text : null,
          generationType: usePageContext && currentContext ? currentContext.type : null
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'AI', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const cleanChunk = chunk.replace(/^data:/gm, '').trim();
          if (cleanChunk) {
            const unescapedChunk = cleanChunk.replace(/\\n/g, '\n');
            setMessages(prev => {
              const last = { ...prev[prev.length - 1] };
              last.content += unescapedChunk;
              return [...prev.slice(0, -1), last];
            });
          }
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'AI', content: '\n\n*Sorry, I couldn\'t process that. Please try again.*' }]);
      }
    } finally {
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  return (
    <div className={`chatbot-panel ${isChatFullScreen ? 'fullscreen' : 'compact'}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <Smile size={20} className="text-accent" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Helper</h3>
          <select 
            value={chatbotLanguage} 
            onChange={(e) => updateChatbotLanguage(e.target.value)}
            className="chatbot-lang-select"
          >
            {['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi', 'Urdu'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="chatbot-header-right">
          <button onClick={() => setMessages([])} title="New Chat" className="icon-btn"><RefreshCw size={16} /></button>
          <button onClick={toggleMinimize} title="Minimize" className="icon-btn"><Minus size={16} /></button>
          <button onClick={toggleFullScreen} title={isChatFullScreen ? "Exit Full Screen" : "Full Screen"} className="icon-btn">
            {isChatFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={closeChat} title="Close" className="icon-btn"><X size={16} /></button>
        </div>
      </div>

      {currentContext && (
        <div className="chatbot-context-banner">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={usePageContext} 
              onChange={(e) => setUsePageContext(e.target.checked)} 
            />
            Using Context: {currentContext.title}
          </label>
        </div>
      )}

      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <div className="chatbot-empty">
            <Smile size={48} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
            <p>Hi! I am Helper. Ask me anything.</p>
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s, idx) => (
                <button key={idx} className="suggestion-btn" onClick={() => handleSend(s)}>💡 {s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-container ${msg.role === 'USER' ? 'user' : 'ai'}`}>
              {msg.role === 'AI' && <Smile size={20} className="chat-avatar" />}
              <div className="chat-bubble">
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="typing-indicator" style={{ padding: '10px' }}>
            <span>.</span><span>.</span><span>.</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask a question..."
          rows={1}
        />
        <div className="chatbot-input-actions">
          {abortControllerRef.current ? (
            <button className="btn-stop" onClick={stopGeneration}><StopCircle size={18} /></button>
          ) : (
            <button className="btn-send" onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatbotPanel;
