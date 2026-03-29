import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/', // Đường dẫn tới Backend Django của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động đính kèm Token nếu user đã đăng nhập
axiosClient.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            // SỬA CHỮ 'token' THÀNH 'access' Ở DÒNG NÀY 👇
            const token = JSON.parse(userInfo).access; 
            
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;