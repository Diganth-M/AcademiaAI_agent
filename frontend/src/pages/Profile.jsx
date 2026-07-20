import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import ProfileHeaderCard from '../components/profile/ProfileHeaderCard';
import PersonalInformationForm from '../components/profile/PersonalInformationForm';
import ContactInformationForm from '../components/profile/ContactInformationForm';
import AcademicInformationForm from '../components/profile/AcademicInformationForm';
import AccountInformationCard from '../components/profile/AccountInformationCard';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import ProfileCompletionCard from '../components/profile/ProfileCompletionCard';
import PreferencesSection from '../components/profile/PreferencesSection';
import ConfirmChangesModal from '../components/profile/ConfirmChangesModal';

const ProfileSkeleton = () => (
  <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ width: '200px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
      <div style={{ width: '350px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
    </div>
    <div className="profile-content" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px', alignItems: 'start' }}>
      {/* Skeleton style overrides for desktop via inline media query if needed, but we'll keep it simple */}
      <style>{`
        @media (min-width: 900px) {
          .profile-content { grid-template-columns: 340px minmax(0, 1fr) !important; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}></div>
          <div style={{ width: '180px', height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
          <div style={{ width: '220px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1.5rem' }}></div>
          <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-card" style={{ height: '300px', background: 'rgba(255,255,255,0.02)' }}></div>
        <div className="glass-card" style={{ height: '300px', background: 'rgba(255,255,255,0.02)' }}></div>
      </div>
    </div>
  </div>
);

const Profile = () => {
  const { user, updateProfileData, loading: authLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        mobileNumber: user.mobileNumber || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postalCode: user.postalCode || '',
        institutionName: user.institutionName || '',
        course: user.course || '',
        department: user.department || '',
        semester: user.semester || '',
        preferredLanguage: user.preferredLanguage || '',
        bio: user.bio || ''
      });
    }
  }, [user, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    let hasChanges = false;
    for (let key in formData) {
      if (formData[key] !== (user[key] || '')) {
        hasChanges = true;
        break;
      }
    }
    
    if (hasChanges) {
      setShowConfirmModal(true);
    } else {
      setIsEditing(false);
      setError('');
      setSuccessMsg('');
    }
  };

  const confirmCancel = () => {
    setIsEditing(false);
    setShowConfirmModal(false);
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    try {
      const response = await updateProfile(formData);
      updateProfileData(response.data);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--text)', fontSize: '2rem' }}>My Profile</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>Manage your personal information and account preferences.</p>
      </div>
      
      {successMsg && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          {successMsg}
        </div>
      )}
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      <style>{`
        .profile-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          align-items: start;
        }
        @media (min-width: 900px) {
          .profile-content {
            grid-template-columns: 340px minmax(0, 1fr);
          }
        }
      `}</style>

      <div className="profile-content">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <ProfileHeaderCard 
            user={user} 
            isEditing={isEditing} 
            onEdit={() => setIsEditing(true)} 
          />
          <ProfileCompletionCard completion={user?.profileCompletion || 0} />
          <AccountInformationCard user={user} />
        </div>
        
        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {isEditing ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Personal Information</h3>
                <PersonalInformationForm formData={formData} onChange={handleInputChange} />
              </div>
              
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Contact Information</h3>
                <ContactInformationForm formData={formData} onChange={handleInputChange} />
              </div>
              
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Academic Information</h3>
                <AcademicInformationForm formData={formData} onChange={handleInputChange} />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={handleCancel}
                  disabled={loading}
                  style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text)' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Personal Information</h3>
                <PersonalInformationForm formData={formData} isReadOnly={true} />
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Contact Information</h3>
                <ContactInformationForm formData={formData} isReadOnly={true} />
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text)' }}>Academic Information</h3>
                <AcademicInformationForm formData={formData} isReadOnly={true} />
              </div>
            </>
          )}
          
          <ChangePasswordForm />
          <PreferencesSection />
        </div>
      </div>
      
      {showConfirmModal && (
        <ConfirmChangesModal 
          onConfirm={confirmCancel} 
          onCancel={() => setShowConfirmModal(false)} 
        />
      )}
    </div>
  );
};

export default Profile;
