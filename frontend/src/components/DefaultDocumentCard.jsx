import React from 'react';
import { useNavigate } from 'react-router-dom';

const DefaultDocumentCard = ({ id, title, description, topic, icon, chapters, readingTime, fileType }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
        e.currentTarget.style.borderColor = 'var(--accent-primary)';
    }}
    onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
    }}
    onClick={() => navigate(`/default-documents/${id}`)}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-gradient)' }} />
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '2.5rem' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#fff' }}>{title}</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ 
              background: 'rgba(124, 58, 237, 0.2)', 
              color: 'var(--accent-primary)',
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              {topic}
            </span>
            <span style={{ 
              background: 'rgba(255,255,255,0.1)', 
              color: '#fff',
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem'
            }}>
              Default Document
            </span>
          </div>
        </div>
      </div>
      
      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1, lineHeight: '1.5' }}>
        {description}
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <span>📚 {chapters} Chapters</span>
        <span>⏱️ {readingTime}</span>
        <span>📄 {fileType}</span>
      </div>
      
      <button 
        className="btn btn-primary"
        style={{ marginTop: '0.5rem', width: '100%' }}
        onClick={(e) => { e.stopPropagation(); navigate(`/default-documents/${id}`); }}
      >
        Open & Analyze
      </button>
    </div>
  );
};

export default DefaultDocumentCard;
