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

// Chatbot Integration
export const getConversations = async () => {
    try {
        const response = await api.get('/chat/conversations');
        return response.data;
    } catch (error) {
        console.error('Failed to get conversations:', error);
        throw error;
    }
};

export const createConversation = async (data) => {
    try {
        const response = await api.post('/chat/conversations', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create conversation:', error);
        throw error;
    }
};

export const getConversationHistory = async (conversationId) => {
    try {
        const response = await api.get(`/chat/conversations/${conversationId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to get conversation history:', error);
        throw error;
    }
};

export const deleteConversation = async (conversationId) => {
    try {
        const response = await api.delete(`/chat/conversations/${conversationId}`);
        return response.data;
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        throw error;
    }
};

export const chatWithAi = async (data) => {
    try {
        const response = await api.post('/chat', data);
        return response.data;
    } catch (error) {
        console.error('Failed to chat with AI:', error);
        throw error;
    }
};



export const generateStudyPlan = (data) => api.post('/study-plans/generate', data);
export const getStudyPlans = () => api.get('/study-plans');
export const getStudyPlan = (id) => api.get(`/study-plans/${id}`);
export const deleteStudyPlan = (id) => api.delete(`/study-plans/${id}`);
export const pauseStudyPlan = (id) => api.put(`/study-plans/${id}/pause`);
export const resumeStudyPlan = (id) => api.put(`/study-plans/${id}/resume`);

export const completeStudySession = (id) => api.put(`/study-sessions/${id}/complete`);
export const skipStudySession = (id) => api.put(`/study-sessions/${id}/skip`);
export const rescheduleStudySession = (id) => api.put(`/study-sessions/${id}/reschedule`);
export const startStudySession = (id) => api.post(`/study-sessions/${id}/start`);



export default api;
