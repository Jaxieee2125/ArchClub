import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useCartStore from '../store/cartStore';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Gửi toàn bộ cái đống mã lằng nhằng trên URL xuống cho Django check
        const { data } = await axiosClient.get(`orders/vnpay-return/?${searchParams.toString()}`);
        if (data.success) {
          setStatus('success');
          clearCart(); // Trả tiền rồi thì mới xóa giỏ hàng
        } else {
          setStatus('failed');
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setStatus('failed');
      }
    };
    verifyPayment();
  }, [clearCart, searchParams]);

  return (
    <div className="min-h-[80vh] bg-black flex items-center justify-center p-4 text-center">
      <div className="bg-[#111] p-10 border border-gray-800 w-full max-w-md">
        {status === 'processing' && <h2 className="text-xl text-yellow-500 font-bold uppercase tracking-widest">Đang xác minh thanh toán...</h2>}
        
        {status === 'success' && (
          <div>
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">✓</div>
            <h2 className="text-2xl text-green-500 font-black uppercase tracking-widest mb-2">Thành công!</h2>
            <p className="text-gray-400 text-sm mb-8">Đơn hàng đã được thanh toán và đang xử lý.</p>
            <Link to="/profile" className="bg-white text-black px-8 py-3 font-bold uppercase text-xs hover:bg-pink-500 hover:text-white transition">
              Xem đơn hàng
            </Link>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">✕</div>
            <h2 className="text-2xl text-red-500 font-black uppercase tracking-widest mb-2">Thất bại</h2>
            <p className="text-gray-400 text-sm mb-8">Giao dịch bị hủy hoặc xảy ra lỗi.</p>
            <Link to="/cart" className="bg-pink-600 text-white px-8 py-3 font-bold uppercase text-xs hover:bg-white hover:text-black transition">
              Quay lại giỏ hàng
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VNPayReturn;