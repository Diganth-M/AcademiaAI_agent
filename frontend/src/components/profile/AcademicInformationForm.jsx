import React from 'react';

export default function AcademicInformationForm({ formData, onChange, isReadOnly = false }) {
  const LANGUAGES = ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Other'];

  if (isReadOnly) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>College or Institution</label>
          <div style={{ color: 'var(--text)' }}>{formData.institutionName || '-'}</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Course or Degree</label>
          <div style={{ color: 'var(--text)' }}>{formData.course || '-'}</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Department</label>
          <div style={{ color: 'var(--text)' }}>{formData.department || '-'}</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Semester or Year</label>
          <div style={{ color: 'var(--text)' }}>{formData.semester || '-'}</div>
        </div>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Preferred Language</label>
          <div style={{ color: 'var(--text)' }}>{formData.preferredLanguage || '-'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
        <label className="form-label">College or Institution Name</label>
        <input 
          type="text" 
          name="institutionName"
          className="form-control" 
          value={formData.institutionName || ''}
          onChange={onChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Course or Degree</label>
        <input 
          type="text" 
          name="course"
          className="form-control" 
          value={formData.course || ''}
          onChange={onChange}
          placeholder="e.g. B.E., B.Tech, BCA"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Department</label>
        <input 
          type="text" 
          name="department"
          className="form-control" 
          value={formData.department || ''}
          onChange={onChange}
          placeholder="e.g. Computer Science"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Current Semester or Year</label>
        <input 
          type="text" 
          name="semester"
          className="form-control" 
          value={formData.semester || ''}
          onChange={onChange}
          placeholder="e.g. 1st Year, 5th Sem"
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Preferred Language</label>
        <select 
          name="preferredLanguage" 
          className="form-control" 
          value={formData.preferredLanguage || ''} 
          onChange={onChange}
          style={{ appearance: 'auto', backgroundColor: 'var(--bg-primary)', color: 'var(--text)' }}
        >
          <option value="">Select Language</option>
          {LANGUAGES.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {formData.preferredLanguage === 'Other' && (
          <input 
            type="text"
            className="form-control"
            style={{ marginTop: '0.5rem' }}
            placeholder="Type your language"
            name="preferredLanguageCustom"
            onChange={(e) => onChange({ target: { name: 'preferredLanguage', value: e.target.value }})}
          />
        )}
      </div>
    </div>
  );
}