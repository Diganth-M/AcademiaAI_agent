import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials, formatNameFromEmail } from '../utils/nameUtils';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Upload Document';
    if (location.pathname === '/history') return 'History';
    if (location.pathname === '/profile') return 'Profile';
    if (location.pathname.startsWith('/document/')) return 'Document View';
    return 'Agent Helper';
  };

  const displayName = 
    user?.fullName?.trim() || 
    user?.username?.trim() || 
    formatNameFromEmail(user?.email);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--glass-border)'
    }}>
      <h2 style={{ margin: 0, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {getPageTitle()}
      </h2>
      
      <div className="account-summary" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 1rem 0.25rem 0.25rem', borderRadius: '30px' }}>
        {user?.profileImageUrl ? (
          <img 
            src={`http://localhost:8080${user.profileImageUrl}`} 
            alt="Profile" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} 
          />
        ) : (
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase'
          }}>
            {getInitials(displayName)}
          </div>
        )}
        
        <div className="account-text" style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="account-name" style={{ color: 'var(--text)', fontWeight: '600', fontSize: '0.9rem' }}>
            {displayName}
          </span>
          <span className="account-email" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'none' }}>
            {user?.email}
          </span>
          {/* Use CSS in a style tag to handle the media query hiding */}
          <style>{`
            @media (min-width: 640px) {
              .account-email { display: block !important; }
            }
          `}</style>
        </div>
        
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--glass-border)', margin: '0 0.25rem' }}></div>
        
        <button 
          onClick={logout} 
          className="logout-button"
          style={{ 
            background: 'transparent', border: 'none', color: '#f87171', 
            cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem',
            transition: 'transform 0.2s'
          }}
          title="Logout"
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <LogOut size={20} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
