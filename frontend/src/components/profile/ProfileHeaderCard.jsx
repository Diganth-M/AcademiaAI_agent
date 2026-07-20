import React, { useRef, useState } from 'react';
import { uploadProfileImage, deleteProfileImage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getInitials, formatNameFromEmail } from '../../utils/nameUtils';

export default function ProfileHeaderCard({ user, isEditing, onEdit }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { updateProfileData, user: authUser } = useAuth();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be below 5 MB.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please select a valid image (JPG, PNG, WEBP).');
      return;
    }

    setError('');
    setUploading(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadProfileImage(formData);
      updateProfileData(res.data);
    } catch (err) {
      setError('Unable to upload the profile image.');
    } finally {
      setUploading(false);
      e.target.value = null; // reset
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setError('');
    try {
      const res = await deleteProfileImage();
      updateProfileData(res.data);
    } catch (err) {
      setError('Unable to remove the profile image.');
    } finally {
      setUploading(false);
    }
  };

  const displayName = 
    user?.fullName?.trim() || 
    user?.username?.trim() || 
    authUser?.fullName?.trim() || 
    authUser?.username?.trim() || 
    formatNameFromEmail(user?.email || authUser?.email);

  return (
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 1.5rem auto' }}>
        {user?.profileImageUrl ? (
          <img 
            src={`http://localhost:8080${user.profileImageUrl}`} 
            alt="Profile" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} 
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '3rem', fontWeight: 'bold', textTransform: 'uppercase'
          }}>
            {getInitials(displayName)}
          </div>
        )}
        
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            Uploading...
          </div>
        )}
      </div>

      <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)' }}>{displayName}</h2>
      <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>{user?.email || authUser?.email}</p>
      {user?.username && (
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>@{user?.username}</p>
      )}
      {!user?.username && <div style={{ marginBottom: '1.5rem' }}></div>}
      
      {error && <p style={{ color: '#f87171', fontSize: '0.875rem', marginTop: '-1rem', marginBottom: '1rem' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/jpeg, image/png, image/webp"
          onChange={handleFileChange}
        />
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
            style={{ flex: 1, padding: '0.5rem' }}
          >
            {user?.profileImageUrl ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          {user?.profileImageUrl && (
            <button 
              className="btn" 
              onClick={handleRemovePhoto}
              disabled={uploading}
              style={{ background: 'transparent', border: '1px solid #f87171', color: '#f87171', padding: '0.5rem' }}
            >
              Remove
            </button>
          )}
        </div>
        
        {!isEditing && (
          <button 
            className="btn" 
            onClick={onEdit}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text)', marginTop: '0.5rem' }}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}