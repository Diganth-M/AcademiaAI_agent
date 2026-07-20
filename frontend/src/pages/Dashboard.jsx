import { useState, useEffect } from 'react';
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
      const response = await api.post('/documents/upload', formData);
      
      const documentId = response?.data?.documentId || response?.data?.id;
      
      if (!documentId) {
        throw new Error("Upload succeeded but document ID was not returned.");
      }
      
      console.log("Upload response:", response.data);
      console.log("Navigating to document:", documentId);
      
      // Redirect to document view with the ID
      navigate(`/document/${documentId}`);
    } catch (error) {
      console.error('Upload failed:', error.response?.data || error);
      alert('Upload failed: ' + (error.response?.data || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{
      minHeight: 'calc(100vh - 64px)', // Adjust based on your navbar height
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      // Using an unsplash image that looks like the provided laptop/notebook image
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1920')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      margin: '-2rem', // Assuming the container has padding, this pulls the background to the edges
      flexDirection: 'column',
      justifyContent: 'flex-start',
      overflowY: 'auto'
    }}>
      <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="glass-card text-center" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontWeight: '700' }}>Build your AI Knowledge Base</h2>
          <p style={{ marginBottom: '2rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontWeight: '500', fontSize: '1.1rem' }}>
            Your Personal AI Professor will help you learn with tailored explanations, real-life examples, and conversational memory.
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
                <p style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', fontWeight: '500' }}>Click to browse or drag and drop a file here</p>
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
