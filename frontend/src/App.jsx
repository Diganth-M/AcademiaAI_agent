import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ChatbotProvider } from './context/ChatbotContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentView from './pages/DocumentView';
import History from './pages/History';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import DefaultDocumentsPage from './pages/DefaultDocumentsPage';
import DefaultDocumentPreview from './pages/DefaultDocumentPreview';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatbotPanel from './components/chatbot/ChatbotPanel';



import bgDashboard from './assets/bg_dashboard.png';
import bgDocument from './assets/bg_document.png';
import bgProfile from './assets/bg_profile.png';
import { useLocation } from 'react-router-dom';

import ErrorBoundary from './components/common/ErrorBoundary';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  let bgImage = bgDashboard;
  
  if (location.pathname.startsWith('/document')) {
    bgImage = bgDocument;
  } else if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/history')) {
    bgImage = bgProfile;
  }

  return (
    <div className="app-container" style={{
      height: '100vh',
      overflow: 'hidden',
      display: 'flex'
    }}>
      <Sidebar />
      <div className="main-content" style={{ 
        flex: 1,
        height: '100vh',
        overflowY: 'auto',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'local',
        backgroundRepeat: 'no-repeat'
      }}>
        <Navbar />
        {children}
      </div>
      <ChatbotPanel />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ChatbotProvider>
          <Router>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/default-documents" element={<ProtectedRoute><Layout><DefaultDocumentsPage /></Layout></ProtectedRoute>} />
                <Route path="/default-documents/:id" element={<ProtectedRoute><Layout><DefaultDocumentPreview /></Layout></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
                <Route path="/document/:id" element={<ProtectedRoute><Layout><DocumentView /></Layout></ProtectedRoute>} />
                <Route path="/document/:id/generate" element={<ProtectedRoute><Layout><DocumentView /></Layout></ProtectedRoute>} />

                <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>} />

              </Routes>
            </ErrorBoundary>
          </Router>
        </ChatbotProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
