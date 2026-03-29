import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError('Mật khẩu không khớp!');
    setLoading(true);
    try {
      await axiosClient.post('users/register/', { first_name: name, email: email, password: password });
      const loginRes = await axiosClient.post('users/login/', { username: email, password: password });
      setUserInfo(loginRes.data);
      navigate('/');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Lỗi đăng ký hoặc Email đã tồn tại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] bg-black px-4 py-12">
      <div className="w-full max-w-md bg-[#111] p-10 border border-gray-800">
        <h2 className="text-3xl font-black text-center text-white mb-10 uppercase tracking-[0.2em]">
          Đăng <span className="text-pink-500">Ký</span>
        </h2>

        {error && <div className="bg-red-900/20 text-red-500 p-3 mb-6 text-center text-[10px] font-bold border border-red-500/50 uppercase tracking-widest">{error}</div>}

        <form onSubmit={submitHandler} className="space-y-4">
          <input type="text" required placeholder="HỌ VÀ TÊN" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-black px-4 py-3 border border-gray-800 focus:border-pink-500 text-white outline-none text-xs" />
          <input type="email" required placeholder="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black px-4 py-3 border border-gray-800 focus:border-pink-500 text-white outline-none text-xs" />
          <input type="password" required placeholder="MẬT KHẨU" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black px-4 py-3 border border-gray-800 focus:border-pink-500 text-white outline-none text-xs" />
          <input type="password" required placeholder="NHẬP LẠI MẬT KHẨU" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-black px-4 py-3 border border-gray-800 focus:border-pink-500 text-white outline-none text-xs" />

          <button type="submit" disabled={loading}
            className="w-full bg-pink-600 text-white font-black py-4 uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all mt-4"
          >
            {loading ? 'Đang tạo...' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-gray-500 uppercase tracking-widest">
          Đã có tài khoản? <Link to="/login" className="text-white font-black hover:text-pink-500 ml-1">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;