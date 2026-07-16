import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
});

// إضافة التوكن لكل طلب
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// معالجة أخطاء الاستجابة (مثل 401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
