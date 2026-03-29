import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const { userInfo } = useAuthStore();

  const [email, setEmail] = useState(userInfo?.email || '');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [note, setNote] = useState('');

  const [shippingFee, setShippingFee] = useState(30000); 
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [couponCode, setCouponCode] = useState('');
  // SỬA ĐỔI 1: Đổi từ lưu % sang lưu thẳng số tiền giảm (Do Backend đã tính sẵn)
  const [discountAmount, setDiscountAmount] = useState(0); 
  const [couponMsg, setCouponMsg] = useState({ type: '', text: '' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city === 'TP Hồ Chí Minh') setShippingFee(20000);
    else if (city === '') setShippingFee(0);
    else setShippingFee(35000);
  }, [city]);

  useEffect(() => {
    if (!userInfo) {
      alert('Vui lòng đăng nhập trước khi đặt hàng!');
      navigate('/login');
    } else if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [userInfo, cartItems, navigate]);

  const subTotal = getTotalPrice();
  // SỬA ĐỔI 2: Không cần tự tính % ở Frontend nữa, lấy thẳng số tiền trừ ra
  const finalTotal = subTotal - discountAmount + shippingFee;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      // SỬA ĐỔI 3: Gọi đúng API Backend tụi mình vừa tạo
      const { data } = await axiosClient.post('orders/apply-coupon/', { 
        code: couponCode,
        cart_total: subTotal // Gửi tổng tiền lên cho Backend check điều kiện
      });
      
      setDiscountAmount(data.discount_amount);
      setCouponMsg({ type: 'success', text: data.message }); // Lấy câu chúc mừng từ Backend
    } catch (err) {
      setDiscountAmount(0);
      setCouponMsg({ type: 'error', text: err.response?.data?.error || 'Mã giảm giá không hợp lệ!' });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      navigate('/login');
      return;
    }
    if (!city) return alert("Vui lòng chọn Tỉnh/Thành phố!");
    setLoading(true);
    const fullShippingInfo = `[${paymentMethod}] ${fullName} - ${phone} | ${address}, ${ward}, ${district}, ${city} | Ghi chú: ${note}`;
    const orderItems = cartItems.map((item) => ({ product_id: item.product_id, qty: item.qty, price: item.price }));

    try {
      const { data } = await axiosClient.post('orders/add/', {
        shippingAddress: fullShippingInfo, 
        totalPrice: finalTotal, 
        discount_amount: discountAmount,
        orderItems: orderItems,
        paymentMethod: paymentMethod 
      });

      if (data.vnpay_url) {
        window.location.href = data.vnpay_url;
      } else {
        alert('Đặt hàng thành công! Mã đơn: #' + data.id);
        clearCart();
        navigate('/profile'); 
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black min-h-screen text-white border-t border-gray-800">
      <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row">
        
        {/* CỘT TRÁI: FORM ĐIỀN THÔNG TIN */}
        <div className="w-full lg:w-[60%] p-6 lg:p-12 lg:pr-20 border-r border-gray-900">
          <Link to="/" className="text-3xl font-extrabold tracking-widest text-white mb-10 block">
            ARCH<span className="text-pink-500">CLUB</span>
          </Link>

          <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-10">
            <div className="flex flex-col md:flex-row gap-12">
              
              {/* Thông tin mua hàng */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold uppercase tracking-wider">Thông tin mua hàng</h2>
                </div>

                <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-[#111] border border-gray-800 rounded-sm focus:border-pink-500 outline-none text-sm transition" />
                
                <input type="text" required placeholder="Họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-3 bg-[#111] border border-gray-800 rounded-sm focus:border-pink-500 outline-none text-sm transition" />
                
                <input type="tel" required placeholder="Số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 bg-[#111] border border-gray-800 rounded-sm focus:border-pink-500 outline-none text-sm transition" />
                
                <input type="text" required placeholder="Địa chỉ chi tiết" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 bg-[#111] border border-gray-800 rounded-sm focus:border-pink-500 outline-none text-sm transition" />

                <select required value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-3 bg-[#111] border border-gray-800 rounded-sm focus:border-pink-500 outline-none text-sm cursor-pointer">
                  <option value="" disabled>Tỉnh thành</option>
                  <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Khác">Khác...</option>
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="Quận/Huyện" value={district} onChange={(e) => setDistrict(e.target.value)} className="p-3 bg-[#111] border border-gray-800 rounded-sm outline-none text-sm" />
                  <input type="text" required placeholder="Phường/Xã" value={ward} onChange={(e) => setWard(e.target.value)} className="p-3 bg-[#111] border border-gray-800 rounded-sm outline-none text-sm" />
                </div>

                <textarea placeholder="Ghi chú (tùy chọn)" rows="3" value={note} onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 bg-[#111] border border-gray-800 rounded-sm focus:border-pink-500 outline-none text-sm resize-none" />
              </div>

              {/* Vận chuyển & Thanh toán */}
              <div className="w-full md:w-1/2 space-y-10">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-4">Vận chuyển</h2>
                  <div className="bg-[#111] border border-pink-500/50 rounded-sm p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full border-4 border-pink-500 bg-black"></div>
                      <span className="text-sm">Giao hàng tận nơi</span>
                    </div>
                    <span className="text-sm font-bold text-pink-500">
                      {city === '' ? '-' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider mb-4">Thanh toán</h2>
                  <div className="border border-gray-800 rounded-sm overflow-hidden divide-y divide-gray-800">
                    <label className={`flex items-center p-4 cursor-pointer transition ${paymentMethod === 'VNPAY' ? 'bg-pink-500/10' : 'bg-[#111]'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'VNPAY'} onChange={() => setPaymentMethod('VNPAY')} className="mr-3 w-4 h-4 accent-pink-500" />
                      <span className="text-sm">Thanh toán VNPay (QR Code, Thẻ ATM, Visa)</span>
                    </label>

                    <label className={`flex items-center p-4 cursor-pointer transition ${paymentMethod === 'COD' ? 'bg-pink-500/10' : 'bg-[#111]'}`}>
                      <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="mr-3 w-4 h-4 accent-pink-500" />
                      <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
        <div className="w-full lg:w-[40%] bg-[#0a0a0a] p-6 lg:p-12 min-h-screen">
          <h2 className="text-xl font-bold mb-8 border-b border-gray-800 pb-4 uppercase tracking-widest">Đơn hàng ({cartItems.length})</h2>

          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between group">
                <div className="flex items-center">
                  <div className="relative border border-gray-800">
                    <img src={`${item.image}`} alt={item.name} className="w-16 h-16 object-cover bg-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-sm uppercase line-clamp-1">{item.name} (SL: {item.qty})</p>
                    <p className="text-[10px] text-gray-500 uppercase">{item.artist}</p>
                  </div>
                </div>
                <div className="font-bold text-sm text-pink-500">
                  {(Number(item.price) * item.qty).toLocaleString('vi-VN')}₫
                </div>
              </div>
            ))}
          </div>

          <div className="border-y border-gray-800 py-8 mb-8">
            <div className="flex space-x-2">
              <input type="text" placeholder="Mã giảm giá" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-grow p-3 bg-black border border-gray-800 rounded-sm outline-none text-sm focus:border-pink-500 transition" />
              <button type="button" onClick={handleApplyCoupon} className="bg-gray-800 hover:bg-pink-500 text-white px-6 rounded-sm font-bold transition text-xs uppercase tracking-widest">
                Áp dụng
              </button>
            </div>
            {couponMsg.text && (
              <p className={`mt-3 text-[11px] font-bold uppercase tracking-tight ${couponMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          <div className="space-y-4 text-sm text-gray-400 mb-8 font-medium uppercase tracking-tight">
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span className="text-white">{subTotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {/* SỬA ĐỔI 4: Check discountAmount thay vì discountPercent */}
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Giảm giá</span>
                <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <div className="flex justify-between border-b border-gray-900 pb-4">
              <span>Phí vận chuyển</span>
              <span className="text-white">{city === '' ? '-' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-white text-lg font-bold">Tổng cộng</span>
              <div className="text-right">
                <span className="block text-[10px] text-gray-500 uppercase">VND</span>
                <span className="text-3xl font-black text-pink-500 tracking-tighter">{finalTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button type="submit" form="checkout-form" disabled={loading} className="w-full bg-pink-600 hover:bg-white hover:text-black text-white py-5 rounded-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-pink-500/20">
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>
            <Link to="/cart" className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center hover:text-white transition">
              ❮ Quay về giỏ hàng
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;