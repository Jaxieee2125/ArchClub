import { create } from 'zustand';

const useAuthStore = create((set) => ({
  // Lấy dữ liệu từ localStorage (nếu đã đăng nhập trước đó)
  userInfo: JSON.parse(localStorage.getItem('userInfo')) || null,

  // Hành động: Lưu user khi đăng nhập thành công
  setUserInfo: (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
    set({ userInfo: data });
  },

  // Hành động: Đăng xuất
  logout: () => {
    localStorage.removeItem('userInfo');
    set({ userInfo: null });
  },
}));

export default useAuthStore;