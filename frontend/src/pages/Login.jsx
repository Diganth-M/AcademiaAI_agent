import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// We'll use FontAwesome or similar generic icons if available, or just emojis/SVG inline
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px', color: '#555' }}>
    <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '10px', color: '#555' }}>
    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6v5H5V8z"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
  </svg>
);

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="#fff" viewBox="0 0 16 16">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2z"/>
    <circle cx="8" cy="8" r="4" fill="#fff"/>
  </svg>
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password, keepLoggedIn);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      /* Using a placeholder unsplash image for the background, 
         you can replace this with your actual image path like url('/src/assets/bg.jpg') */
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: '300', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Assignment Helper
        </h1>
      </div>

      <div style={{
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '3rem 2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <img src="/src/assets/hero.png" alt="Assignment Helper Logo" style={{ width: '80px', height: 'auto', objectFit: 'contain' }} />
        </div>

        {error && <div style={{ color: '#ff4d4d', marginBottom: '1rem', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 1rem', borderRadius: '4px' }}>
            <UserIcon />
            <input 
              type="text" 
              placeholder="Username or Email Address" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                border: 'none',
                outline: 'none',
                padding: '1rem 0',
                width: '100%',
                fontSize: '1rem',
                color: '#333'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 1rem', borderRadius: '4px', position: 'relative' }}>
            <LockIcon />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                border: 'none',
                outline: 'none',
                padding: '1rem 0',
                width: '100%',
                fontSize: '1rem',
                color: '#333',
                paddingRight: '60px'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#555',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                padding: '0.5rem'
              }}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'flex-start', margin: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="keepLoggedIn" 
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            <label htmlFor="keepLoggedIn" style={{ color: '#fff', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}>
              Keep Me Logged In
            </label>
          </div>

          <button type="submit" style={{
            background: '#0078d7',
            color: '#fff',
            border: 'none',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '4px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '0.5rem'
          }}>
            Log In
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <Link to="/forgot-password" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase' }}>
            Forgot Password?
          </Link>
          <Link to="/register" style={{ color: '#ccc', textDecoration: 'none', fontWeight: 'bold', textTransform: 'uppercase' }}>
            New User? Register
          </Link>
        </div>

      </div>
      
      <div style={{ marginTop: '2rem', color: '#ccc', fontSize: '0.85rem' }}>
        &copy; 2026 Assignment Helper . All rights reserved
      </div>
    </div>
  );
};

export default Login;

