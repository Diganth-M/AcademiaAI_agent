import React, { useState } from 'react';
import { changePassword } from '../../services/api';

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };
  
  const validatePassword = (pwd) => {
    // Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }
    
    if (!validatePassword(formData.newPassword)) {
      setError('Password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword
      });
      setSuccess('Password changed successfully.');
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Current password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({ label, name, value, show, setShow }) => (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input 
          type={show ? "text" : "password"} 
          name={name}
          className="form-control" 
          value={value}
          onChange={handleChange}
          required
          style={{ paddingRight: '40px' }}
        />
        <button 
          type="button" 
          onClick={() => setShow(!show)}
          style={{ 
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
          }}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Change Password</h3>
      
      {error && <div style={{ color: '#f87171', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: '#4ade80', marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '4px' }}>{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <PasswordInput 
          label="Current Password" 
          name="currentPassword" 
          value={formData.currentPassword} 
          show={showCurrent} setShow={setShowCurrent} 
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <PasswordInput 
            label="New Password" 
            name="newPassword" 
            value={formData.newPassword} 
            show={showNew} setShow={setShowNew} 
          />
          <PasswordInput 
            label="Confirm New Password" 
            name="confirmNewPassword" 
            value={formData.confirmNewPassword} 
            show={showConfirm} setShow={setShowConfirm} 
          />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || !formData.currentPassword || !formData.newPassword}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}