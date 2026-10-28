import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
};

export const visitorAPI = {
  getAll: () => API.get('/visitors'),
  getById: (id) => API.get(`/visitors/${id}`),
  create: (data) => API.post('/visitors', data),
  recordExit: (id) => API.patch(`/visitors/${id}/exit`),
  delete: (id) => API.delete(`/visitors/${id}`),
};

export const maintenanceAPI = {
  getAll: () => API.get('/maintenance'),
  getById: (id) => API.get(`/maintenance/${id}`),
  create: (data) => API.post('/maintenance', data),
  update: (id, data) => API.patch(`/maintenance/${id}`, data),
  delete: (id) => API.delete(`/maintenance/${id}`),
};

export const userAPI = {
  getAll: () => API.get('/users'),
  update: (id, data) => API.patch(`/users/${id}`, data),
};

export const apartmentAPI = {
  getAll: () => API.get('/apartments'),
  create: (data) => API.post('/apartments', data),
};

export const alertAPI = {
  create: (data) => API.post('/alerts', data),
  getAll: () => API.get('/alerts'),
  resolve: (id) => API.patch(`/alerts/${id}/resolve`),
};

export default API;
