import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import EmailPromptModal from '../components/common/EmailPromptModal';
import { MessageCircle, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import InteractiveQuiz from '../components/quiz/InteractiveQuiz';
import { useChatbot } from '../context/ChatbotContext';

const DocumentView = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('explanation'); // explanation, assignment, mcq, viva
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState({ visible: false, x: 0, y: 0, text: '' });
  const { isChatOpen, openChat, setCurrentContext, setUsePageContext } = useChatbot();
  
  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [latestGeneratedContent, setLatestGeneratedContent] = useState(null);
  
  const [generationLanguage, setGenerationLanguage] = useState('English');
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Invalid document ID.");
      setLoading(false);
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchDocument();
      await fetchHistory();
    } catch (err) {
      console.error("Data loading failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      if (!res.data) {
        throw new Error("Empty document response.");
      }
      setDocument(res.data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("You are not authorized to view this document.");
      } else if (status === 404) {
        setError("Document not found.");
      } else {
        setError("Unable to load the document.");
      }
      throw err;
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/agent/history/${id}`);
      setHistory(res.data || []);
    } catch (err) {
      console.error("History fetch failed:", err);
      // History fetch failure should not crash the page if document loaded successfully
    }
  };

  const handleLanguageChange = async (newLanguage) => {
    setGenerationLanguage(newLanguage);
    
    // Check if there is an existing generated output for the active tab
    const currentTypeHistory = history.filter(h => h.type.toLowerCase() === activeTab.toLowerCase());
    
    if (currentTypeHistory.length > 0) {
      const latestGeneration = currentTypeHistory[0];
      setTranslating(true);
      try {
        const response = await api.post('/agent/translate', {
          text: latestGeneration.output,
          targetLanguage: newLanguage
        });
        
        // Update the history locally with the translated text
        const translatedText = response.data.translatedText;
        setHistory(prevHistory => {
          const newHistory = [...prevHistory];
          const idx = newHistory.findIndex(h => h.id === latestGeneration.id);
          if (idx !== -1) {
            newHistory[idx] = { ...newHistory[idx], output: translatedText };
          }
          return newHistory;
        });
        
        // If the email modal might use it, update it too
        if (latestGeneratedContent && latestGeneratedContent.id === latestGeneration.id) {
            setLatestGeneratedContent({...latestGeneratedContent, output: translatedText});
        }
      } catch (err) {
        console.error('Failed to translate:', err);
      } finally {
        setTranslating(false);
      }
    }
  };

  const handleGenerate = async (type) => {
    setGenerating(true);
    try {
      let finalPrompt = additionalPrompt;
      if (type === 'mcq') {
        const jsonInstruction = " Respond ONLY with a valid JSON array where each object has: question, options (array of exactly 4 strings), correctAnswer (string, exactly matching one option), explanation (string). Do not wrap in markdown blocks, just raw JSON.";
        finalPrompt = finalPrompt ? finalPrompt + "\n\n" + jsonInstruction : jsonInstruction;
      }
      
      const response = await api.post('/agent/generate', {
        documentId: id,
        type: type,
        additionalPrompt: finalPrompt,
        language: generationLanguage
      });
      await fetchHistory();
      setAdditionalPrompt('');
      
      // Store latest generated content and trigger email modal
      setLatestGeneratedContent({
        content: response.data.output,
        contentType: type,
        topic: document?.title || 'Study Material'
      });
      setShowEmailModal(true);
      
      // Auto full screen when generating is done for better reading experience
      setIsFullScreen(true);
      
    } catch (err) {
      alert('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!latestGeneratedContent) throw new Error("No content to send");
    await api.post('/agent/email-content', latestGeneratedContent);
  };

  const currentTypeHistory = (history || []).filter(h => h?.type?.toLowerCase() === activeTab);
  const generatedContext = currentTypeHistory.map(h => h?.output).join('\n\n');

  // Automatically update chatbot context when generated content changes
  useEffect(() => {
    if (generatedContext) {
      setCurrentContext({
        title: `Document: ${document?.title} (${activeTab})`,
        text: generatedContext,
        type: activeTab
      });
    }
  }, [generatedContext, document, activeTab]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem auto', width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3 style={{ color: 'var(--accent-primary)', margin: 0 }}>Loading document...</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please wait while we retrieve your workspace.</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem' }}>
         <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '3rem',
            maxWidth: '600px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '1rem', color: '#fff' }}>{error || "Document not found."}</h2>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={loadData}
              >
                Try Again
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/dashboard'}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
      </div>
    );
  }

  const handleMouseUp = (e) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      setSelectionMenu({
        visible: true,
        x: e.pageX,
        y: e.pageY,
        text
      });
    } else {
      setSelectionMenu({ ...selectionMenu, visible: false });
    }
  };

  const handleContextAction = (action) => {
    setCurrentContext({
      title: 'Selected Text',
      text: `${action}: "${selectionMenu.text}"`,
      type: 'selection'
    });
    setUsePageContext(true);
    openChat();
    setSelectionMenu({ ...selectionMenu, visible: false });
    window.getSelection().removeAllRanges();
  };

  const fullScreenStyle = isFullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    margin: 0,
    borderRadius: 0,
    background: 'var(--bg-primary)'
  } : {};

  const renderMainContent = () => (
    <div className="glass-card" style={{ height: isFullScreen ? '100vh' : '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', ...fullScreenStyle }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ textTransform: 'capitalize', color: 'var(--accent-primary)', margin: 0 }}>
          AI Tutor: {activeTab}
        </h2>
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
          title={isFullScreen ? "Minimize" : "Full Screen"}
        >
          {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
        </button>
      </div>
      
      {activeTab === 'assignment' && (
        <div className="form-group">
          <label className="form-label">Questions (Optional)</label>
          <textarea 
            className="form-control" 
            rows="3" 
            placeholder="Paste specific assignment questions here..."
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
          ></textarea>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          className="btn btn-primary" 
          style={{ width: 'fit-content' }}
          onClick={() => handleGenerate(activeTab)}
          disabled={generating}
        >
          {generating ? 'Generating...' : `Generate ${activeTab}`}
        </button>
        
        <select 
          value={generationLanguage} 
          onChange={(e) => handleLanguageChange(e.target.value)}
          disabled={translating || generating}
          className="form-control"
          style={{ width: 'auto', padding: '8px 12px' }}
        >
          <option value="English">English</option>
          <option value="Tamil">தமிழ் (Tamil)</option>
          <option value="Malayalam">മലയാളം (Malayalam)</option>
          <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
          <option value="Telugu">తెలుగు (Telugu)</option>
        </select>
        {translating && <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', marginLeft: '10px' }}>Translating...</span>}
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }} onMouseUp={handleMouseUp}>
        {currentTypeHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {currentTypeHistory.map((item, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '1.5rem', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)'
              }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Generated on {new Date(item.createdAt).toLocaleString()}
                </div>
                {item.prompt && <div style={{ marginBottom: '1rem', fontStyle: 'italic' }}>Q: {item.prompt}</div>}
                <div className="chat-bubble ai-message" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                  {activeTab === 'mcq' ? (
                    <InteractiveQuiz data={item.output} />
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
                      {item.output}
                    </ReactMarkdown>
                  )}
                </div>
                
                {/* Interactive Lesson Follow-ups */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem', fontWeight: '500' }}>
                    Continue Learning:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
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
                      "Translate to simple English"
                    ].map((opt, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          openChat();
                          // Optional: prefill input if we had a way, but since it's global we can just open it
                        }}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = 'var(--accent-primary)';
                          e.target.style.borderColor = 'var(--accent-primary)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.05)';
                          e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center" style={{ color: 'var(--text-secondary)', padding: '3rem' }}>
            No {activeTab} generated yet. Click generate above!
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      <div className="animate-fade-in" style={{ 
        flex: 1, 
        display: 'grid', 
        gridTemplateColumns: isMobile || isChatOpen || isFullScreen ? '1fr' : '1fr 2fr', 
        gap: '2rem', 
        paddingRight: (isChatOpen && !isMobile && !isFullScreen) ? '500px' : '0',
        transition: 'padding-right 0.3s ease, grid-template-columns 0.3s ease',
        width: '100%',
        height: (isMobile || isChatOpen || isFullScreen) ? 'auto' : 'calc(100vh - 120px)'
      }}>
        {/* Sidebar Controls - Hide when in full screen */}
        {!isFullScreen && (
          <div className="glass-card" style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', flexShrink: 0 }}>
              {document.title}
              {document.sourceType === 'DEFAULT_DOCUMENT' && (
                <span style={{ 
                  marginLeft: '10px', 
                  fontSize: '0.7rem', 
                  background: 'var(--accent-primary)', 
                  color: '#fff', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  verticalAlign: 'middle'
                }}>
                  Default Document
                </span>
              )}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', flex: 1 }}>
              {['explanation', 'assignment', 'mcq', 'viva'].map(tab => (
                <button
                  key={tab}
                  className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ justifyContent: 'flex-start', textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Email Prompt positioned in left sidebar */}
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <EmailPromptModal 
                isOpen={showEmailModal} 
                onClose={() => setShowEmailModal(false)}
                onConfirm={handleSendEmail}
                contentType={latestGeneratedContent?.contentType}
              />
            </div>
          </div>
        )}
        
        {isFullScreen ? createPortal(renderMainContent(), window.document.body) : renderMainContent()}
      </div>
    </div>
  );
};

export default DocumentView;
