import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const DocumentView = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('explanation'); // explanation, assignment, mcq, viva
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  useEffect(() => {
    fetchDocument();
    fetchHistory();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      setDocument(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/agent/history/${id}`);
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    setGenerating(true);
    try {
      await api.post('/agent/generate', {
        documentId: id,
        type: type,
        additionalPrompt: additionalPrompt
      });
      await fetchHistory();
      setAdditionalPrompt('');
    } catch (err) {
      alert('Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '3rem' }}>Loading...</div>;
  if (!document) return <div className="text-center">Document not found</div>;

  const currentTypeHistory = history.filter(h => h.type.toLowerCase() === activeTab);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      
      {/* Sidebar Controls */}
      <div className="glass-card" style={{ height: 'fit-content' }}>
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          {document.title}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }}>
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
      </div>
      
      {/* Main Content Area */}
      <div className="glass-card" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ textTransform: 'capitalize', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
          {activeTab} Generator
        </h2>
        
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
        
        <button 
          className="btn btn-primary" 
          style={{ width: 'fit-content', marginBottom: '2rem' }}
          onClick={() => handleGenerate(activeTab)}
          disabled={generating}
        >
          {generating ? 'Generating...' : `Generate ${activeTab}`}
        </button>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
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
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{item.output}</div>
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
      
    </div>
  );
};

export default DocumentView;
