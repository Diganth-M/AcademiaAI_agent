import React from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg, #0f172a)',
          color: 'var(--text-h, #fff)'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-lg, 12px)',
            padding: '3rem',
            maxWidth: '600px',
            width: '100%'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Something went wrong while loading this page.</h2>
            <p style={{ color: 'var(--text-secondary, #9ca3af)', marginBottom: '2rem' }}>
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Try Again
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (this.props.navigate) {
                    this.props.navigate('/history');
                  } else {
                    window.location.href = '/history';
                  }
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundaryInner navigate={navigate} {...props} />;
};

export default ErrorBoundary;
