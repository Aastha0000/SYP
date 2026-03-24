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
export const getAdminData = () => API.get('/admin/data');
export const verifyGuide = (id) => API.put(`/admin/verify-guide/${id}`);
export const rejectGuide = (id) => API.put(`/admin/reject-guide/${id}`);
export const getAdminDestinations = () => API.get('/admin/destinations');
export const deleteDestination = (id) => API.delete(`/admin/destinations/${id}`);
export const uploadDestination = (formData) => API.post('/admin/destinations', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const getGuides = () => API.get('/guides');
export const getGuideById = (id) => API.get(`/guides/${id}`);
export const createBooking = (data) => API.post('/bookings', data);
export const getUserBookings = (userId) => API.get(`/bookings/user/${userId}`);
export const getGuideBookings = (guideId) => API.get(`/bookings/guide/${guideId}`);
export const getAllBookings = () => API.get('/bookings');

export const sendMessage = (data) => API.post('/messages', data);
export const getConversation = (userA, userB) => API.get(`/messages/${userA}/${userB}`);
export const getInbox = (userId) => API.get(`/messages/inbox/${userId}`);
export const markConversationRead = (userId, otherId) => API.put(`/messages/read-all`, { userId, otherId });

export const searchUsers = (q, role) => API.get(`/users/search?q=${q}&role=${role}`);
export const updateUser = (id, data) => {
    // Check if data is FormData (for files)
    if (data instanceof FormData) {
        return API.put(`/users/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    return API.put(`/users/${id}`, data);
};
export const getUnreadCount = (userId) => API.get(`/messages/unread-count/${userId}`);

export const getGuideReviews = (id) => API.get(`/guides/${id}/reviews`);
export const postReview = (id, data) => API.post(`/guides/${id}/reviews`, data);

// Public Destinations
export const getDestinations = () => API.get('/destinations');
export const getDestinationById = (id) => API.get(`/destinations/${id}`);

export default API;
