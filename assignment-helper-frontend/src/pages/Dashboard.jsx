import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Redirect to document view with the ID
      navigate(`/document/${response.data.id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-card text-center">
          <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Upload your Notes or PDF</h2>
          <p style={{ marginBottom: '2rem' }}>
            Get AI-generated explanations, assignments, MCQs, and viva questions instantly.
          </p>
          
          <form onSubmit={handleUpload}>
            <div 
              style={{ 
                border: '2px dashed var(--glass-border)', 
                padding: '3rem', 
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2rem',
                cursor: 'pointer',
                background: 'rgba(0,0,0,0.2)'
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input 
                id="file-upload"
                type="file" 
                accept=".pdf,.txt" 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
              {file ? (
                <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>{file.name} selected</p>
              ) : (
                <p>Click to browse or drag and drop a file here</p>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={!file || loading}
              style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            >
              {loading ? 'Uploading & Processing...' : 'Upload & Analyze'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
