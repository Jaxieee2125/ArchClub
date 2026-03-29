import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../store/authStore';

const Profile = () => {
  const { userInfo, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State để quản lý việc mở/đóng chi tiết của từng đơn hàng
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        // Gọi API lấy danh sách đơn hàng của user đang đăng nhập
        const { data } = await axiosClient.get('orders/myorders/');
        setOrders(data);
      } catch (err) {
        console.error('Lỗi khi tải đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [userInfo, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Đóng nếu đang mở
    } else {
      setExpandedOrderId(orderId); // Mở chi tiết đơn này
    }
  };

  // Hàm phụ để render màu sắc trạng thái cho đẹp
  const getStatusDisplay = (status, isPaid) => {
    if (status === 'Delivered') return <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 text-[10px] font-bold uppercase">Đã giao hàng</span>;
    if (status === 'Processing' || isPaid) return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-1 text-[10px] font-bold uppercase">Đang xử lý</span>;
    if (status === 'Cancelled') return <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-1 text-[10px] font-bold uppercase">Đã hủy</span>;
    return <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-1 text-[10px] font-bold uppercase">Chờ xác nhận</span>;
  };

  if (!userInfo) return null;

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* Banner nhỏ */}
      <div className="bg-[#111] border-b border-gray-800 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-black uppercase tracking-widest text-white">
            Tài khoản của tôi
          </h1>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row gap-8">
        
        {/* ================= CỘT TRÁI: THÔNG TIN USER ================= */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-[#111] border border-gray-800 p-6 sticky top-24">
            <div className="flex flex-col items-center border-b border-gray-800 pb-6 mb-6">
              <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center text-3xl font-black mb-4 uppercase">
                {userInfo.username.charAt(0)}
              </div>
              <h2 className="text-xl font-bold uppercase tracking-widest text-center">{userInfo.username}</h2>
              <p className="text-sm text-gray-500 mt-1">{userInfo.email}</p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full bg-black border border-gray-700 text-white hover:bg-red-600 hover:border-red-600 py-3 text-xs font-bold uppercase tracking-widest transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* ================= CỘT PHẢI: LỊCH SỬ ĐƠN HÀNG ================= */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <h2 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">
            Lịch sử mua hàng
          </h2>

          {loading ? (
            <div className="text-pink-500 font-bold uppercase tracking-widest animate-pulse">Đang tải dữ liệu...</div>
          ) : orders.length === 0 ? (
            <div className="bg-[#111] border border-gray-800 p-10 text-center">
              <p className="text-gray-500 mb-4 uppercase tracking-widest">Bạn chưa có đơn hàng nào.</p>
              <button 
                onClick={() => navigate('/shop')}
                className="bg-pink-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-[#111] border border-gray-800 transition hover:border-gray-600">
                  
                  {/* Phần Tóm tắt đơn hàng (Bấm vào để mở rộng) */}
                  <div 
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">ĐƠN #{order.id}</span>
                        {getStatusDisplay(order.status, order.is_paid)}
                      </div>
                      <span className="text-xs text-gray-500 uppercase tracking-widest">
                        {new Date(order.created_at).toLocaleDateString('vi-VN')} • {order.payment_method || 'COD'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-4 sm:mt-0 justify-between">
                      <span className="text-lg font-black text-pink-500">
                        {Number(order.total_price).toLocaleString('vi-VN')} ₫
                      </span>
                      <span className={`text-xl text-gray-500 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Phần Chi tiết Đơn hàng (Ẩn/Hiện dựa vào State) */}
                  {expandedOrderId === order.id && (
                    <div className="border-t border-gray-800 p-5 bg-black/50">
                      
                      {/* Địa chỉ giao hàng */}
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Thông tin giao hàng:</h4>
                        <p className="text-sm text-gray-300">{order.shipping_address}</p>
                      </div>

                      {/* Danh sách sản phẩm */}
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sản phẩm:</h4>
                      <div className="space-y-3">
                        {/* Lưu ý: Backend phải trả về orderItems hoặc orderitem_set */}
                        {(order.orderItems || order.orderitem_set || []).map((item, index) => (
                          <div key={index} className="flex items-center gap-4 bg-black border border-gray-800 p-3">
                            <div className="w-12 h-12 bg-[#111] flex items-center justify-center border border-gray-700">
                              {/* Có ảnh thì hiện, không thì hiện Placeholder */}
                              {item.image ? (
                                <img src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[8px] text-pink-500">AC</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold uppercase truncate">{item.name || item.product?.name}</p>
                              <p className="text-xs text-gray-500 uppercase">SL: {item.quantity || item.qty}</p>
                            </div>
                            <div className="text-sm font-bold">
                              {Number(item.price).toLocaleString('vi-VN')} ₫
                            </div>
                          </div>
                        ))}
                      </div>
                      
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;