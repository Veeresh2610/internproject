import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('org_id') || '1'; // default org_id
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (orgId) {
      // Backend expects org_id in headers
      config.headers['org-id'] = orgId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
