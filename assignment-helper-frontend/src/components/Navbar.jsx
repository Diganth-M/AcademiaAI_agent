import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

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
        Dashboard
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Welcome, {user?.username}</span>
        <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
