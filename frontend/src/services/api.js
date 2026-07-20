import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email, newPassword, confirmPassword) => api.post('/auth/reset-password', { email, newPassword, confirmPassword });
export const resendOtp = (email) => api.post('/auth/resend-otp', { email });
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const uploadProfileImage = (formData) => api.post('/users/profile/image', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  }
});
export const deleteProfileImage = () => api.delete('/users/profile/image');
export const changePassword = (data) => api.put('/users/profile/password', data);
export const getProfileStatistics = () => api.get('/users/profile/statistics');

export default api;
