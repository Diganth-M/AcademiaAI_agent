import React, { useState, useEffect, useRef } from 'react';
import { X, Send, FileDown, Mic, Smile, Maximize2, Minimize2, Paperclip, StopCircle, PlayCircle, Image as ImageIcon } from 'lucide-react';
import ChatMessageItem from './ChatMessageItem';
import { getChatHistory } from '../../services/chatService';
import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import './Chatbox.css';

const SUGGESTIONS = [
  "Explain any topic",
  "Give beginner explanation",
  "Give advanced explanation",
  "Give real-life examples",
  "Give interview explanation",
  "Give exam explanation",
  "Generate diagrams in text",
  "Explain line-by-line",
  "Generate mnemonics",
  "Ask follow-up questions",
  "Suggest related topics",
  "Detect weak concepts",
  "Recommend revision order"
];

const Chatbox = ({ documentId, generatedContext, isOpen, onClose, isMobile, externalPrompt, setExternalPrompt }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to fullscreen for ChatGPT style
  const [language, setLanguage] = useState('English');
  const [attachment, setAttachment] = useState(null); // { file, base64 }
  const [isDragging, setIsDragging] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (documentId && isOpen) {
      loadHistory();
    }
    // Cleanup abort controller on unmount
    return () => stopGeneration();
  }, [documentId, isOpen]);

  useEffect(() => {
    if (externalPrompt) {
      handleSend(externalPrompt);
      setExternalPrompt('');
    }
  }, [externalPrompt]);



  const loadHistory = async () => {
    try {
      const history = await getChatHistory(documentId);
      setMessages(history);
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const handleLanguageChange = async (newLang) => {
    setLanguage(newLang);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert("Currently only image attachments are supported.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachment({ file, base64: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleSend = async (text = input, overrideAttachment = attachment) => {
    if (!text.trim() && !overrideAttachment) return;
    
    // Cancel any ongoing generation
    stopGeneration();
    abortControllerRef.current = new AbortController();

    const userMsg = { role: 'USER', content: text, attachment: overrideAttachment?.base64 };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
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
          documentId,
          message: text,
          generatedContext,
          language,
          base64Image: overrideAttachment?.base64 || null
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error('Stream failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'AI', content: '' }]);

      let done = false;
      let fullResponse = '';
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const cleanChunk = chunk.replace(/^data:/gm, '').trim();
          if (cleanChunk) {
            const unescapedChunk = cleanChunk.replace(/\\n/g, '\n');
            fullResponse += unescapedChunk;
            setMessages(prev => {
              const last = { ...prev[prev.length - 1] };
              last.content += unescapedChunk;
              return [...prev.slice(0, -1), last];
            });
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation stopped by user');
      } else {
        console.error(error);
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'AI', content: '\n\n*Sorry, I couldn\'t process that. Please try again.*' }]);
      }
    } finally {
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleExportPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = messages.map(m => `<b>${m.role}</b>: <p>${m.content}</p>`).join('<hr/>');
    html2pdf().from(element).save('chat_export.pdf');
  };

  const handleExportDOCX = () => {
    const docChildren = messages.map(m => {
      return new Paragraph({
        children: [
          new TextRun({ text: m.role + ": ", bold: true }),
          new TextRun({ text: m.content })
        ]
      });
    });
    
    const doc = new Document({
      sections: [{ children: docChildren }]
    });

    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'chat_export.docx';
      a.click();
    });
  };

  const handleExportMarkdown = () => {
    const text = messages.map(m => `**${m.role}**\n\n${m.content}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_export.md';
    a.click();
    URL.revokeObjectURL(url);
  };



  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'USER' || m.role === 'user');
    if (lastUserMessage) {
      handleSend(lastUserMessage.content, { base64: lastUserMessage.attachment });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const content = (
    <div 
      className={`chatbox-container ${isFullscreen ? 'chatbox-fullscreen' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {isDragging && (
        <div className="dropzone-overlay">
          <ImageIcon size={48} />
          <h2>Drop image to attach</h2>
        </div>
      )}

      <div className="chatbox-header">
        <h3 className="helper-title"><em>Helper</em></h3>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          <select 
            value={language} 
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
          >
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Malayalam">Malayalam</option>
          </select>
          
          <div className="dropdown">
            <button className="icon-btn" title="Export Chat"><FileDown size={18} /></button>
            <div className="dropdown-content" style={{position: 'absolute', right: '50px', background: '#333', border: '1px solid #555', padding: '10px', display: 'flex', flexDirection: 'column'}}>
              <button onClick={handleExportPDF}>PDF</button>
              <button onClick={handleExportDOCX}>DOCX</button>
              <button onClick={handleExportMarkdown}>Markdown</button>
            </div>
          </div>

          <button className="icon-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit Full Screen" : "Full Screen"}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.length === 0 ? (
          <div style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>
            <Smile size={40} style={{marginBottom: '10px'}} />
            <p>Hi! I am Helper. I have studied your document and built a knowledge base. How can I help you learn this topic today?</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <ChatMessageItem 
              key={idx} 
              message={msg} 
              onActionClick={handleSend}
              onRegenerate={handleRegenerate}
              isLast={idx === messages.length - 1}
            />
          ))
        )}
        {isTyping && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 0 && (
        <div className="chatbox-suggestions">
          {SUGGESTIONS.slice(0, 4).map((s, idx) => (
            <button key={idx} className="suggestion-chip" onClick={() => handleSend(s)}>
              💡 {s}
            </button>
          ))}
        </div>
      )}

      <div className="chatbox-input-wrapper" style={{padding: '0 16px', marginBottom: '16px'}}>
        {attachment && (
          <div className="attachment-preview" style={{position: 'relative', display: 'inline-block', marginBottom: '10px'}}>
            <img src={attachment.base64} alt="attachment" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}}/>
            <button onClick={() => setAttachment(null)} style={{position: 'absolute', top: '-5px', right: '-5px', background: 'red', borderRadius: '50%', color: 'white', border: 'none'}}><X size={12} /></button>
          </div>
        )}
        <div className="chatbox-input" style={{borderRadius: '24px'}}>
          <button className="icon-btn" onClick={() => fileInputRef.current.click()} title="Attach Image">
            <Paperclip size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{display: 'none'}} 
            accept="image/*"
            onChange={handleFileChange}
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message Helper..."
            rows={1}
          />
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            
            {abortControllerRef.current ? (
              <button className="send-btn stop-btn" style={{background: 'red'}} onClick={stopGeneration} title="Stop Generation">
                <StopCircle size={18} />
              </button>
            ) : (
              <button 
                className="send-btn" 
                onClick={() => handleSend()}
                disabled={(!input.trim() && !attachment) || isTyping}
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile && !isFullscreen) {
    if (!isOpen) return null;
    return (
      <div className="chat-drawer-overlay">
        {content}
      </div>
    );
  }

  return isOpen ? content : null;
};

export default Chatbox;
