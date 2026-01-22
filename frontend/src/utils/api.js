import axios from 'axios';

// In development, Vite proxies /api to localhost:5000 via vite.config.js
// In production, it serves from the same origin.
const api = axios.create({
    baseURL: '',
});

api.interceptors.request.use((config) => {
    const state = localStorage.getItem('auth-storage');
    if (state) {
        const parsed = JSON.parse(state);
        const token = parsed?.state?.userInfo?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
