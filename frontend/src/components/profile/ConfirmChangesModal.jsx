import React from 'react';

export default function ConfirmChangesModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="glass-card animate-fade-in" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2rem' }}>
          ⚠️
        </div>
        
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text)' }}>Unsaved Changes</h3>
        <p style={{ margin: '0 0 2rem 0', color: 'var(--text-secondary)' }}>
          You have unsaved profile changes. Are you sure you want to leave without saving?
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn" 
            onClick={onCancel}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text)', flex: 1 }}
          >
            No, continue editing
          </button>
          <button 
            className="btn btn-primary" 
            onClick={onConfirm}
            style={{ backgroundColor: '#f87171', flex: 1 }}
          >
            Yes, discard
          </button>
        </div>
      </div>
    </div>
  );
}