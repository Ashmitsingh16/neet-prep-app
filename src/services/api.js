import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on auth page
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export const registerUser = (name, email, password) =>
  API.post('/auth/register', { name, email, password });

export const loginUser = (email, password) =>
  API.post('/auth/login', { email, password });

export const getProfile = () => API.get('/auth/profile');

export const submitTest = (data) => API.post('/test/submit', data);

export const getTestHistory = (page = 1, limit = 10) =>
  API.get(`/test/history?page=${page}&limit=${limit}`);

export const getAdaptiveQuestions = (count = 20, subject) => {
  let url = `/test/adaptive?count=${count}`;
  if (subject) url += `&subject=${subject}`;
  return API.get(url);
};

export default API;
