import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axiosClient.post('users/login/', { username: email, password: password });
      setUserInfo(response.data);
      navigate('/');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-black px-4">
      <div className="w-full max-w-md bg-[#111] p-10 border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-black text-center text-white mb-10 uppercase tracking-[0.2em]">
          Đăng <span className="text-pink-500">Nhập</span>
        </h2>

        {error && <div className="bg-red-900/20 text-red-500 p-3 mb-6 text-center text-xs font-bold border border-red-500/50 uppercase tracking-widest">{error}</div>}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Tên đăng nhập / Email</label>
            <input
              type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black px-4 py-3 border border-gray-800 focus:border-pink-500 text-white outline-none transition text-sm"
              placeholder="Tên đăng nhập hoặc Email"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Mật khẩu</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black px-4 py-3 border border-gray-800 focus:border-pink-500 text-white outline-none transition text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-pink-600 text-white font-black py-4 uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all disabled:bg-gray-800"
          >
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-pink-500 font-black hover:underline ml-1">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;