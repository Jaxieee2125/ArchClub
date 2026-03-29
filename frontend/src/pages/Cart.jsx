import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const Cart = () => {
  const navigate = useNavigate();
  // Lấy thêm hàm addToCart từ store để xử lý tăng/giảm số lượng
  const { cartItems, removeFromCart, getTotalPrice, addToCart } = useCartStore();

  const updateQtyHandler = (item, newQty) => {
    if (newQty > 0 && newQty <= item.stock) {
      // Vì store dùng addToCart để xử lý cả cập nhật, ta tính độ chênh lệch
      // Hoặc đơn giản là viết lại logic cập nhật số lượng trong store (tạm thời dùng cách này cho nhanh)
      addToCart({ id: item.product_id, ...item }, newQty - item.qty);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* 1. Header trang Giỏ hàng */}
      <div className="bg-[#111] border-b border-gray-800 mb-8">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-2xl font-bold uppercase tracking-widest text-white">
            Giỏ hàng của bạn
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-[#111] border border-gray-800">
            <p className="text-xl text-gray-500 mb-8 uppercase tracking-widest">Giỏ hàng đang trống</p>
            <Link to="/" className="inline-block bg-pink-500 text-white px-10 py-3 font-bold hover:bg-white hover:text-black transition uppercase text-sm">
              Tiếp tục mua hàng
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* 2. Bảng Giỏ hàng (Desktop) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-gray-800">
                <thead>
                  <tr className="bg-[#111] text-xs uppercase tracking-widest text-gray-400 border-b border-gray-800">
                    <th className="p-4 font-bold">Hình ảnh</th>
                    <th className="p-4 font-bold">Tên sản phẩm</th>
                    <th className="p-4 font-bold text-center">Giá bán lẻ</th>
                    <th className="p-4 font-bold text-center">Số lượng</th>
                    <th className="p-4 font-bold text-center">Tạm tính</th>
                    <th className="p-4 font-bold text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {cartItems.map((item) => (
                    <tr key={item.product_id} className="hover:bg-[#0a0a0a] transition">
                      <td className="p-4 w-32">
                        <img 
                          src={`${item.image}`} 
                          className="w-24 h-24 object-cover border border-gray-700 bg-white" 
                          alt={item.name} 
                        />
                      </td>
                      <td className="p-4">
                        <p className="text-[10px] text-pink-500 uppercase font-bold mb-1">{item.artist}</p>
                        <Link to={`/product/${item.product_id}`} className="font-bold hover:text-pink-500 transition text-sm uppercase">
                          {item.name}
                        </Link>
                      </td>
                      <td className="p-4 text-center font-medium text-sm">
                        {Number(item.price).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center border border-gray-700 bg-black">
                            <button 
                              onClick={() => updateQtyHandler(item, item.qty - 1)}
                              className="px-3 py-1 hover:text-pink-500 font-bold"
                            >-</button>
                            <span className="w-10 text-center text-sm font-bold border-x border-gray-700 py-1">{item.qty}</span>
                            <button 
                              onClick={() => updateQtyHandler(item, item.qty + 1)}
                              className="px-3 py-1 hover:text-pink-500 font-bold"
                            >+</button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-pink-500 text-sm">
                        {(Number(item.price) * item.qty).toLocaleString('vi-VN')}₫
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-500 hover:text-red-500 transition"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3. Nút điều hướng phụ */}
            <div className="flex justify-between mt-6">
              <Link to="/" className="border border-gray-700 px-6 py-2 text-xs font-bold uppercase hover:bg-white hover:text-black transition">
                Tiếp tục mua hàng
              </Link>
            </div>

            {/* 4. Tổng tiền & Thanh toán */}
            <div className="mt-12 flex flex-col items-end space-y-4">
              <div className="flex items-center space-x-8">
                <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Tổng tiền:</span>
                <span className="text-3xl font-bold text-pink-500 tracking-tighter">
                  {getTotalPrice().toLocaleString('vi-VN')}₫
                </span>
              </div>
              
              <p className="text-xs text-gray-500 italic">* Giá chưa bao gồm phí vận chuyển và mã giảm giá.</p>
              
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full md:w-80 bg-pink-600 hover:bg-white hover:text-black text-white font-bold py-4 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-pink-500/20"
              >
                Tiến hành thanh toán <span className="text-xl">➔</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;