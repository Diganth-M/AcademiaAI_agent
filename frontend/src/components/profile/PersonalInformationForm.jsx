import React from 'react';

export default function PersonalInformationForm({ formData, onChange, isReadOnly = false }) {
  const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

  if (isReadOnly) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Full Name</label>
          <div style={{ color: 'var(--text)' }}>{formData.fullName || '-'}</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Gender</label>
          <div style={{ color: 'var(--text)' }}>{formData.gender || '-'}</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Date of Birth</label>
          <div style={{ color: 'var(--text)' }}>{formData.dateOfBirth || '-'}</div>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Short Bio</label>
          <div style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{formData.bio || '-'}</div>
        </div>
      </div>
    );
  }

  // Get today's date for max attribute in date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
        <label className="form-label">Full Name <span style={{color: '#f87171'}}>*</span></label>
        <input 
          type="text" 
          name="fullName"
          className="form-control" 
          value={formData.fullName || ''}
          onChange={onChange}
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Gender</label>
        <select 
          name="gender" 
          className="form-control" 
          value={formData.gender || ''} 
          onChange={onChange}
          style={{ appearance: 'auto', backgroundColor: 'var(--bg-primary)', color: 'var(--text)' }}
        >
          <option value="">Select Gender</option>
          {GENDER_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Date of Birth</label>
        <input 
          type="date" 
          name="dateOfBirth"
          className="form-control" 
          value={formData.dateOfBirth || ''}
          onChange={onChange}
          max={today}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
        <label className="form-label">Short Bio</label>
        <textarea 
          name="bio"
          className="form-control" 
          value={formData.bio || ''}
          onChange={onChange}
          placeholder="Tell us a bit about yourself..."
          rows="4"
        />
      </div>
    </div>
  );
}