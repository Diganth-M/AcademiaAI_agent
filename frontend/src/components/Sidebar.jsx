import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChatbot } from '../context/ChatbotContext';
import { useAuth } from '../context/AuthContext';
import { getInitials, formatNameFromEmail } from '../utils/nameUtils';
import { 
  FileUp, 
  LibraryBig, 
  History, 
  CircleUserRound, 
  BotMessageSquare, 
  BrainCircuit,
  LogOut,
} from 'lucide-react';
import bgSidebar from '../assets/bg_sidebar.png';

const sidebarItems = [
  {
    label: "Upload Document",
    path: "/dashboard",
    icon: FileUp
  },
  {
    label: "Default Documents",
    path: "/default-documents",
    icon: LibraryBig
  },


  {
    label: "History",
    path: "/history",
    icon: History
  },
  {
    label: "Profile",
    path: "/profile",
    icon: CircleUserRound
  }
];

const Sidebar = () => {
  const { openChat } = useChatbot();
  const { user } = useAuth();
  
  const displayName = 
    user?.fullName?.trim() || 
    user?.username?.trim() || 
    formatNameFromEmail(user?.email);

  return (
    <aside style={{
      width: '250px',
      height: '100vh',
      overflowY: 'auto',
      backgroundImage: `linear-gradient(rgba(30, 41, 59, 0.85), rgba(30, 41, 59, 0.85)), url(${bgSidebar})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem',
      position: 'relative'
    }}>
      <div className="sidebar-brand" style={{ padding: '0 0.5rem', zIndex: 2, display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white' }}>
        <BrainCircuit size={28} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>AcademiaAI</span> agent
        </h2>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 2, flex: 1 }}>
        {sidebarItems.map((item) => (
          <NavLink 
            key={item.label} 
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              minHeight: '58px',
              padding: '0 18px',
              gap: '16px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#b8c4da',
              background: isActive ? 'linear-gradient(135deg, #6366f1, #7c5cf5)' : 'transparent',
              boxShadow: isActive ? '0 8px 24px rgba(99, 102, 241, 0.25)' : 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? '600' : '400'
            })}
            onMouseOver={(e) => { 
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.transform = 'translateX(3px)';
              }
            }}
            onMouseOut={(e) => { 
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#b8c4da';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span className="sidebar-icon" style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <item.icon size={22} strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="sidebar-label" style={{ whiteSpace: 'nowrap' }}>
              {item.label}
            </span>
          </NavLink>
        ))}
        
        <button 
          onClick={openChat}
          className="sidebar-item"
          style={{
            minHeight: '58px',
            padding: '0 18px',
            gap: '16px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            color: '#b8c4da',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}
          onMouseOver={(e) => { 
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateX(3px)';
          }}
          onMouseOut={(e) => { 
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#b8c4da';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span className="sidebar-icon" style={{ width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BotMessageSquare size={22} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="sidebar-label" style={{ whiteSpace: 'nowrap' }}>
            Helper Chat
          </span>
        </button>
      </div>
      
      {/* User Profile Summary */}
      <div style={{ zIndex: 2, marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <NavLink to="/profile" style={{ 
          display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit',
          padding: '0.75rem 0.5rem', borderRadius: '14px', transition: 'background-color 0.3s'
        }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'var(--text)', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>
              {displayName}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              View Profile
            </div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
