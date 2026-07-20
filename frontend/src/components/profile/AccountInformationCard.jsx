import React, { useEffect, useState } from 'react';
import { getProfileStatistics } from '../../services/api';

export default function AccountInformationCard({ user }) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getProfileStatistics();
        setStats(res.data);
      } catch (e) {
        console.error("Failed to fetch statistics", e);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="glass-card" style={{ padding: '2rem' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text)' }}>Account Information</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Account Created</span>
          <span style={{ color: 'var(--text)' }}>{formatDate(stats?.accountCreatedDate || user?.createdAt)}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Last Login</span>
          <span style={{ color: 'var(--text)' }}>{formatDate(stats?.lastLoginDate || user?.lastLoginAt)}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Email Verification</span>
          <span style={{ color: stats?.emailVerified ? '#4ade80' : '#facc15' }}>
            {stats?.emailVerified ? 'Verified' : 'Pending'}
          </span>
        </div>
        
        <hr style={{ border: 0, borderTop: '1px solid var(--glass-border)', margin: '0.5rem 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Uploaded Documents</span>
          <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{stats?.uploadedDocumentsCount || 0}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Assignments Generated</span>
          <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{stats?.generatedAssignmentsCount || 0}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>MCQs Generated</span>
          <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{stats?.generatedMcqsCount || 0}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Viva Questions Generated</span>
          <span style={{ color: 'var(--text)', fontWeight: 'bold' }}>{stats?.generatedVivaQuestionsCount || 0}</span>
        </div>
      </div>
    </div>
  );
}