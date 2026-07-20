import React from 'react';

export default function ProfileCompletionCard({ completion = 0 }) {
  let color = '#f87171'; // red
  if (completion >= 50) color = '#facc15'; // yellow
  if (completion >= 80) color = '#4ade80'; // green

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Profile Completion</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Status</span>
        <span style={{ fontWeight: 'bold', color: color }}>{completion}%</span>
      </div>
      
      <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ height: '100%', width: `${completion}%`, backgroundColor: color, transition: 'width 0.5s ease-in-out' }}></div>
      </div>
      
      {completion < 100 && (
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Add more details like your profile picture, academic information, and bio to complete your profile.
        </p>
      )}
    </div>
  );
}