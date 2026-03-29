import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const Header = () => {
  const navigate = useNavigate();
  
  // Lấy thêm các hàm và dữ liệu từ CartStore để hiển thị popup
  const { getTotalItems, cartItems, getTotalPrice, removeFromCart } = useCartStore();
  const { userInfo } = useAuthStore();
  
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/search?q=${searchKeyword}`);
    }
  };

  const categories = [
    { name: 'ALL', icon: '✦', color: 'text-white', path: '/shop' },
    { name: 'VINYL', icon: '◉', color: 'text-pink-500', path: '/shop?product_format=VINYL' },
    { name: 'CD', icon: '💿', color: 'text-gray-400', path: '/shop?product_format=CD' },
    { name: 'CASSETTE', icon: '📼', color: 'text-gray-400', path: '/shop?product_format=CASSETTE' },
    { name: 'BY AC', icon: '★', color: 'text-yellow-500', path: '/search?q=BY AC' },
    { name: 'RESTOCK', icon: '⬇', color: 'text-green-500', path: '/search?q=RESTOCK' },
    { name: 'MERCH', icon: '👕', color: 'text-pink-500', path: '/shop?product_format=MERCH' },
    { name: 'GEAR', icon: '🎸', color: 'text-blue-500', path: '/shop?product_format=GEAR' },
    { name: 'SALE', icon: '🔖', color: 'text-pink-500', isHot: true, path: '/search?q=SALE' },
  ];

  return (
    <header className="w-full text-white font-sans border-b-2 border-pink-500 sticky top-0 z-50 shadow-xl shadow-pink-500/10">
      
      {/* TẦNG 1: Nền đen xám (Logo, Search, Icon) */}
      <div className="bg-[#111111] py-4 px-4 border-b border-gray-800">
        <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="text-3xl font-extrabold tracking-widest text-white flex items-center gap-2 hover:opacity-80 transition">
            <span className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">★</span>
            ARCH<span className="text-pink-500">CLUB</span>
          </Link>

          {/* Thanh Tìm Kiếm */}
          <form onSubmit={handleSearch} className="flex-grow max-w-2xl w-full flex">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-black border border-gray-700 focus:border-pink-500 text-white placeholder-gray-500 px-4 py-2 outline-none transition rounded-l-md"
            />
            <button type="submit" className="bg-pink-500 text-white px-5 hover:bg-pink-600 transition rounded-r-md font-bold">
              🔍
            </button>
          </form>

          {/* Cụm Icon (Phone, User, Cart) */}
          <div className="flex items-center space-x-6">
            

            {userInfo ? (
              <Link to="/profile" className="flex items-center gap-2 hover:text-pink-500 transition font-bold uppercase text-sm">
                👤 {userInfo.username}
              </Link>
            ) : (
              <Link to="/login" className="flex items-center gap-2 hover:text-pink-500 transition font-bold uppercase text-sm">
                👤 LOGIN
              </Link>
            )}

            {/* ==================== KHU VỰC GIỎ HÀNG (CÓ HOVER POPUP) ==================== */}
            <div className="relative group">
              {/* Nút Giỏ Hàng chính */}
              <Link to="/cart" className="relative flex items-center hover:text-pink-500 transition py-2">
                <span className="text-3xl">🛒</span>
                {getTotalItems() > 0 && (
                  <span className="absolute top-0 -right-2 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black shadow-md">
                    {getTotalItems()}
                  </span>
                )}
              </Link>

              {/* Popup Dropdown (Bình thường ẩn, di chuột vào group thì hiện) */}
              <div className="absolute top-full right-0 pt-2 w-[320px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="bg-[#111] border border-gray-800 shadow-2xl p-4 flex flex-col cursor-default">
                  
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-3 mb-4">
                    Sản phẩm đã cho vào giỏ hàng
                  </h3>

                  {cartItems.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-6 uppercase tracking-widest">
                      Giỏ hàng trống
                    </p>
                  ) : (
                    <>
                      {/* Danh sách sản phẩm */}
                      <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-4 mb-4">
                        {cartItems.map((item) => {
                          const imageUrl = item.image 
                            ? (item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`)
                            : 'https://placehold.co/100x100/111111/ec4899?text=AC';

                          return (
                            <div key={item.product_id} className="flex gap-3 relative group/item">
                              {/* Cột ảnh */}
                              <img src={imageUrl} alt={item.name} className="w-16 h-16 object-cover bg-black border border-gray-800" />
                              
                              {/* Cột thông tin */}
                              <div className="flex-1 pr-6">
                                <Link to={`/product/${item.product_id}`} className="text-xs font-bold uppercase line-clamp-2 hover:text-pink-500 transition leading-tight mb-1 text-white">
                                  {item.name}
                                </Link>
                                <div className="text-[11px] font-bold text-pink-500 mb-1">
                                  {Number(item.price).toLocaleString('vi-VN')} ₫
                                </div>
                                <div className="text-[10px] text-gray-500 uppercase">
                                  Số lượng: <span className="text-white">{item.qty}</span>
                                </div>
                              </div>

                              {/* Nút xóa (Dấu X) */}
                              <button
                                onClick={() => removeFromCart(item.product_id)}
                                className="absolute top-0 right-0 text-gray-500 hover:text-red-500 font-black text-lg px-1 leading-none"
                                title="Xóa sản phẩm"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer: Tổng tiền & Nút chốt đơn */}
                      <div className="border-t border-gray-800 pt-4 mt-2">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Tổng cộng:</span>
                          <span className="text-base font-black text-pink-500">{getTotalPrice().toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="flex gap-2">
                          <Link to="/cart" className="flex-1 bg-black text-white border border-gray-700 text-center py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition">
                            🛒 Giỏ hàng
                          </Link>
                          <Link to="/checkout" className="flex-1 bg-pink-600 text-white text-center py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition">
                            ✔ Thanh toán
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* ==================== END KHU VỰC GIỎ HÀNG ==================== */}

          </div>
        </div>
      </div>

      {/* TẦNG 2: Menu Phân loại */}
      <div className="bg-black px-4">
        <div className="container mx-auto max-w-7xl">
          <ul className="flex items-center space-x-6 overflow-x-auto py-3 text-xs font-bold tracking-widest uppercase whitespace-nowrap scrollbar-hide text-gray-300">
            {categories.map((cat, index) => (
              <li 
                key={index}
                onClick={() => navigate(cat.path)}
                className={`cursor-pointer transition flex items-center gap-1 hover:text-pink-500 ${cat.isHot ? 'text-pink-500' : ''}`}
              >
                <span className={`${cat.color} text-[10px]`}>{cat.icon}</span> {cat.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
    </header>
  );
};

export default Header;