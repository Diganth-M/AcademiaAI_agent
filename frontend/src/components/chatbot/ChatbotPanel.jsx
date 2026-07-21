import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Maximize2, Minimize2, Minus, Send, Mic, BotMessageSquare, StopCircle, RefreshCw, Volume2, VolumeX, Copy, Check, Play, Pause } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import api from '../../services/api';
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
    usePageContext, setUsePageContext, currentContext,
    autoReadAloud, setAutoReadAloud
  } = useChatbot();
  const { chatbotLanguage, updateChatbotLanguage } = useLanguage();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => {
          // simple heuristic to append or replace
          return transcript; 
        });
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  if (!isChatOpen) return null;

  if (isChatMinimized) {
    return (
      <div className="chatbot-launcher-badge" onClick={toggleMinimize}>
        <BotMessageSquare size={24} />
      </div>
    );
  }

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        // Map language to speech locale
        const langMap = {
          'English': 'en-IN',
          'Tamil': 'ta-IN',
          'Hindi': 'hi-IN',
          'Telugu': 'te-IN',
          'Kannada': 'kn-IN',
          'Malayalam': 'ml-IN'
        };
        recognitionRef.current.lang = langMap[chatbotLanguage] || 'en-IN';
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  const speakText = (text, messageId) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      'English': 'en-IN',
      'Tamil': 'ta-IN',
      'Hindi': 'hi-IN',
      'Telugu': 'te-IN',
      'Kannada': 'kn-IN',
      'Malayalam': 'ml-IN'
    };
    utterance.lang = langMap[chatbotLanguage] || 'en-IN';
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeakingMessageId(messageId);
      setIsSpeechPaused(false);
    };
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    synthRef.current.speak(utterance);
  };

  const togglePauseSpeech = () => {
    if (synthRef.current.paused) {
      synthRef.current.resume();
      setIsSpeechPaused(false);
    } else {
      synthRef.current.pause();
      setIsSpeechPaused(true);
    }
  };

  const stopSpeech = () => {
    synthRef.current.cancel();
    setSpeakingMessageId(null);
    setIsSpeechPaused(false);
  };

  const getChatErrorMessage = (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const msg = error.response?.data?.message;

    if (msg) return msg;

    if (status === 401) return "Your session has expired. Please log in again.";
    if (status === 403) return "You do not have permission to use this assistant.";
    if (status === 404) return "The chatbot service was not found.";
    if (status === 422) return "Please enter a valid question.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status === 500 || code === 'INTERNAL_SERVER_ERROR') return "The assistant service encountered an error.";
    if (code === 'AI_PROVIDER_UNAVAILABLE') return "The AI service is temporarily unavailable.";
    return "Unable to connect to the server. Make sure the backend is running.";
  };

  const handleSend = async (text = input) => {
    const trimmedMessage = text.trim();
    if (!trimmedMessage || isTyping) return;
    
    if (isListening) toggleListen();

    const userMessageId = crypto.randomUUID();
    const userMsg = { id: userMessageId, role: 'USER', content: trimmedMessage, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const activeDocumentId = window.location.pathname.startsWith('/document/') ? parseInt(window.location.pathname.split('/')[2]) : null;

    try {
      const response = await api.post('/chat', {
        message: trimmedMessage,
        conversationId: activeConversationId,
        documentId: activeDocumentId,
        language: chatbotLanguage,
        pageContext: usePageContext && currentContext ? currentContext.text : window.location.pathname,
        responseStyle: "DETAILED"
      });

      const answer = response?.data?.answer;

      if (!answer || typeof answer !== "string") {
        throw new Error("Chat API returned an empty answer.");
      }

      setActiveConversationId(response.data.conversationId);

      const aiMsgId = crypto.randomUUID();
      const aiMsg = {
        id: aiMsgId,
        role: 'AI',
        content: answer,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMsg]);

      // Check auto read aloud
      if (autoReadAloud) {
        // Small delay to allow render
        setTimeout(() => speakText(answer, aiMsgId), 300);
      }

    } catch (error) {
      console.error("Chat request failed:", error);
      const errorMsg = getChatErrorMessage(error);
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'AI',
          content: errorMsg,
          isError: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`chatbot-panel ${isChatFullScreen ? 'fullscreen' : 'compact'}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <BotMessageSquare size={24} className="text-accent" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AcademiaAI agent</h3>
          <select 
            value={chatbotLanguage} 
            onChange={(e) => updateChatbotLanguage(e.target.value)}
            className="chatbot-lang-select"
            title="Select Language"
          >
            {['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Tanglish'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="chatbot-header-right">
          <button onClick={() => setAutoReadAloud(!autoReadAloud)} title={autoReadAloud ? "Auto-read is ON" : "Auto-read is OFF"} className="icon-btn">
            {autoReadAloud ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={() => { setMessages([]); setActiveConversationId(null); stopSpeech(); }} title="New Chat / Refresh" className="icon-btn"><RefreshCw size={16} /></button>
          <button onClick={toggleMinimize} title="Minimize" className="icon-btn"><Minus size={16} /></button>
          <button onClick={toggleFullScreen} title={isChatFullScreen ? "Exit Full Screen" : "Full Screen"} className="icon-btn">
            {isChatFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={() => { stopSpeech(); closeChat(); }} title="Close" className="icon-btn"><X size={16} /></button>
        </div>
      </div>

      {currentContext && (
        <div className="chatbot-context-banner">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
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
            <BotMessageSquare size={48} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
            <h2 style={{ marginBottom: '0.5rem', color: '#fff' }}>How can I help you today?</h2>
            <p>Ask about your document, assignment, MCQ, Java, Python, or OOP...</p>
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s, idx) => (
                <button key={idx} className="suggestion-btn" onClick={() => handleSend(s)}>{s}</button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`chat-bubble-container ${msg.role === 'USER' ? 'user' : 'ai'}`}>
              {msg.role === 'AI' && <BotMessageSquare size={24} className="chat-avatar" />}
              <div style={{ flex: 1 }}>
                <div className={`chat-bubble ${msg.isError ? 'error' : ''}`}>
                  {msg.role === 'USER' ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              {...props}
                              children={String(children).replace(/\n$/, '')}
                              style={vs2015}
                              language={match[1]}
                              PreTag="div"
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  )}
                </div>
                {msg.role === 'AI' && !msg.isError && (
                  <div className="msg-actions">
                    <button onClick={() => copyToClipboard(msg.content, msg.id)} className="msg-action-btn" title="Copy text">
                      {copiedId === msg.id ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                    
                    {speakingMessageId === msg.id ? (
                      <>
                        <button onClick={togglePauseSpeech} className="msg-action-btn" title={isSpeechPaused ? "Resume" : "Pause"}>
                          {isSpeechPaused ? <Play size={14} /> : <Pause size={14} />} {isSpeechPaused ? "Resume" : "Pause"}
                        </button>
                        <button onClick={stopSpeech} className="msg-action-btn" title="Stop">
                          <StopCircle size={14} /> Stop
                        </button>
                      </>
                    ) : (
                      <button onClick={() => speakText(msg.content, msg.id)} className="msg-action-btn" title="Read Aloud">
                        <Volume2 size={14} /> Read Aloud
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="chat-bubble-container ai">
            <BotMessageSquare size={24} className="chat-avatar" style={{ opacity: 0.5 }} />
            <div className="typing-indicator" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#94a3b8' }}>
              AcademiaAI agent is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-area">
        <div className="chatbot-input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your document, assignment, MCQ, Java, Python..."
            rows={Math.min(5, Math.max(1, input.split('\n').length))}
            disabled={isTyping}
          />
          <div className="chatbot-input-actions">
            <button 
              className={`btn-mic ${isListening ? 'listening' : ''}`} 
              onClick={toggleListen}
              title={isListening ? "Stop listening" : "Voice input"}
              disabled={isTyping}
            >
              {isListening ? <StopCircle size={18} /> : <Mic size={18} />}
            </button>
            <button 
              className="btn-send" 
              onClick={() => handleSend()} 
              disabled={!input.trim() || isTyping}
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPanel;
