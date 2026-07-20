import React, { useState } from 'react';

export default function PreferencesSection() {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    assignmentNotifications: true,
    studyReminders: false,
    darkMode: true,
    showProfilePicture: true,
    shareAnalytics: false
  });

  const togglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const Toggle = ({ label, checked, onChange }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--glass-border)' }}>
      <span style={{ color: 'var(--text)' }}>{label}</span>
      <div 
        onClick={onChange}
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: checked ? 'var(--accent-primary)' : 'rgba(255,255,255,0.2)',
          borderRadius: '12px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        <div style={{
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Privacy & Preferences</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Toggle 
          label="Email Notifications" 
          checked={preferences.emailNotifications} 
          onChange={() => togglePreference('emailNotifications')} 
        />
        <Toggle 
          label="Assignment Generation Notifications" 
          checked={preferences.assignmentNotifications} 
          onChange={() => togglePreference('assignmentNotifications')} 
        />
        <Toggle 
          label="Study Reminders" 
          checked={preferences.studyReminders} 
          onChange={() => togglePreference('studyReminders')} 
        />
        <Toggle 
          label="Dark Mode" 
          checked={preferences.darkMode} 
          onChange={() => togglePreference('darkMode')} 
        />
        <Toggle 
          label="Show Profile Picture Publicly" 
          checked={preferences.showProfilePicture} 
          onChange={() => togglePreference('showProfilePicture')} 
        />
        <Toggle 
          label="Share Usage Analytics" 
          checked={preferences.shareAnalytics} 
          onChange={() => togglePreference('shareAnalytics')} 
        />
      </div>
    </div>
  );
}