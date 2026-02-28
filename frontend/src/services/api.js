import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
    withCredentials: false,
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const loginUser = (data) => API.post('/auth/login', data);
export const signupUser = (data) => API.post('/auth/signup', data);

export default API;
