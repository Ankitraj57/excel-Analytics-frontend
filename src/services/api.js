import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const login = ({ email, password }) => api.post('/auth/login', { email, password });
export const register = ({ name, email, password, role }) => api.post('/auth/register', { name, email, password, role });
export const forgotPassword = ({ email }) => api.post('/auth/forgot-password', { email });
export const getAdminUsers = () => api.get('/admin/users');
export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);
export const updateUserRole = (userId, role) => api.put(`/admin/users/${userId}/role`, { role });

// Protected APIs
export const getAdminData = () => api.get('/admin/data');
export const getUploads = () => api.get('/admin/uploads'); 
export const getUpload = (id) => api.get(`/admin/uploads/${id}`);
export const analyzeData = (data) => api.post('/ai-insight/analyze', { data });

export default api;