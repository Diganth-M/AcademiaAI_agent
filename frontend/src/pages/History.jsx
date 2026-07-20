import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const History = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/documents/history');
      setDocuments(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this document? This will also delete all generated content associated with it.')) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete document');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL documents? This cannot be undone.')) return;
    try {
      await api.delete('/documents/history/clear');
      setDocuments([]);
    } catch (err) {
      console.error(err);
      alert('Failed to clear history');
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '3rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--accent-primary)', margin: 0 }}>Your Documents</h2>
        {documents.length > 0 && (
          <button 
            className="btn" 
            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }} 
            onClick={handleClearAll}
          >
            Clear All History
          </button>
        )}
      </div>
      
      {documents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {documents.map((doc) => (
            <Link key={doc.id} to={`/document/${doc.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ height: '100%', cursor: 'pointer', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
                  <button 
                    onClick={(e) => handleDelete(e, doc.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Delete Document"
                  >
                    🗑️
                  </button>
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '30px' }}>
                  {doc.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Uploaded on: {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center" style={{ padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
          <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>No documents uploaded yet.</p>
          <Link to="/dashboard" className="btn btn-primary">Go to Dashboard to Upload</Link>
        </div>
      )}
    </div>
  );
};

export default History;
