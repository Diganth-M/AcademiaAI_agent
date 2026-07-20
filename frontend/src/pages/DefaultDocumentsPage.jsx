import React from 'react';
import DefaultDocumentCard from '../components/DefaultDocumentCard';
import { defaultDocuments } from '../data/defaultDocuments';

const DefaultDocumentsPage = () => {
  return (
    <div className="animate-fade-in" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '100%',
      paddingBottom: '4rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
          Default Learning Documents
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Choose a built-in document and start learning instantly. No manual upload is required.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {defaultDocuments.map(doc => (
          <DefaultDocumentCard key={doc.id} {...doc} />
        ))}
      </div>
    </div>
  );
};

export default DefaultDocumentsPage;
