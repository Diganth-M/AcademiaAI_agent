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

  if (loading) return <div className="text-center" style={{ padding: '3rem' }}>Loading...</div>;

  return (
    <div className="animate-fade-in">
      <h2 style={{ color: 'var(--accent-primary)', marginBottom: '2rem' }}>Your Documents</h2>
      
      {documents.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {documents.map((doc) => (
            <Link key={doc.id} to={`/document/${doc.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
          <Link to="/" className="btn btn-primary">Go to Dashboard to Upload</Link>
        </div>
      )}
    </div>
  );
};

export default History;
