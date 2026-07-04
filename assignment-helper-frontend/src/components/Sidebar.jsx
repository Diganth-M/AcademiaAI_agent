import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'History', path: '/history' },
  ];

  return (
    <aside style={{
      width: '250px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div className="logo" style={{ padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
          <span style={{ color: 'var(--accent-primary)' }}>Agent</span> Helper
        </h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                transition: 'var(--transition)',
                fontWeight: isActive ? '600' : '400',
              }}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
