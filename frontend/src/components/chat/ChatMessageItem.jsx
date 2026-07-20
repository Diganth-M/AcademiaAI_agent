import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Bot, User, ThumbsUp, ThumbsDown, FolderDown, RefreshCw, MoreHorizontal, PlayCircle } from 'lucide-react';
import './Chatbox.css';

const INTERACTIVE_OPTIONS = [
  "Ask another question",
  "Give easier explanation",
  "Give harder explanation",
  "Show real-life example",
  "Show interview question",
  "Generate quiz",
  "Test my knowledge",
  "Generate flashcards",
  "Explain with analogy",
  "Show diagram",
  "Translate to simple English",
  "Continue generation"
];

const ChatMessageItem = ({ message, onActionClick, onRegenerate, isLast }) => {
  const isUser = message.role === 'USER' || message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Read aloud is not supported in this browser.');
    }
  };

  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}>
      <div className="chat-avatar">
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="chat-content-container" style={{maxWidth: isUser ? '85%' : '100%', width: '100%'}}>
        {!isUser && (
          <div className="chat-actions">
            <button className="icon-btn" onClick={handleReadAloud} title="Read Aloud">
              <PlayCircle size={16} />
            </button>
            <button className="icon-btn" onClick={handleCopy} title="Copy">
              <Copy size={16} />
            </button>
            <button className="icon-btn" title="Good response">
              <ThumbsUp size={16} />
            </button>
            <button className="icon-btn" title="Bad response">
              <ThumbsDown size={16} />
            </button>
            <button className="icon-btn" title="Save to folder">
              <FolderDown size={16} />
            </button>
            {isLast && onRegenerate && (
              <button className="icon-btn" onClick={onRegenerate} title="Regenerate">
                <RefreshCw size={16} />
              </button>
            )}
            <button className="icon-btn" title="More options">
              <MoreHorizontal size={16} />
            </button>
          </div>
        )}
        <div className="chat-bubble" style={{width: '100%'}}>
          {isUser && message.attachment && (
            <div style={{marginBottom: '10px'}}>
              <img src={message.attachment} alt="User attachment" style={{maxWidth: '300px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)'}} />
            </div>
          )}
          
          {isUser ? (
            <p>{message.content}</p>
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
              {message.content}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && onActionClick && isLast && (
          <div className="interactive-options">
            {INTERACTIVE_OPTIONS.map((option, idx) => (
              <button 
                key={idx} 
                className="interactive-option-btn"
                onClick={() => onActionClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageItem;
