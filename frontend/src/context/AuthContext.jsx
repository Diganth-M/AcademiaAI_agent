import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/profile');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user profile", error);
          const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (userData) setUser(JSON.parse(userData));
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const updateProfileData = (newData) => {
    setUser(newData);
    
    // Determine if we should use localStorage or sessionStorage based on where token is
    const isLocal = !!localStorage.getItem('token');
    const storage = isLocal ? localStorage : sessionStorage;
    
    const existingUserData = JSON.parse(storage.getItem('user') || '{}');
    const updatedUserData = {
      ...existingUserData,
      fullName: newData.fullName,
      username: newData.username,
      email: newData.email,
      profileImageUrl: newData.profileImageUrl
    };
    
    storage.setItem('user', JSON.stringify(updatedUserData));
  };

  const login = async (username, password, keepLoggedIn = false) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, id, email, username: actualUsername } = response.data;
    
    if (keepLoggedIn) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    
    // Fetch full profile data so the UI has name and image immediately
    try {
      const profileResponse = await api.get('/users/profile');
      const profileData = profileResponse.data;
      
      const userData = {
        id,
        username: actualUsername,
        email,
        fullName: profileData.fullName,
        profileImageUrl: profileData.profileImageUrl
      };
      
      if (keepLoggedIn) {
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
      
      setUser(userData);
      return response.data;
    } catch (err) {
      console.error("Failed to fetch full profile after login", err);
      // Fallback
      const fallbackUserData = { id, username: actualUsername, email };
      if (keepLoggedIn) {
        localStorage.setItem('user', JSON.stringify(fallbackUserData));
      } else {
        sessionStorage.setItem('user', JSON.stringify(fallbackUserData));
      }
      setUser(fallbackUserData);
      return response.data;
    }
  };

  const register = async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    updateProfileData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
