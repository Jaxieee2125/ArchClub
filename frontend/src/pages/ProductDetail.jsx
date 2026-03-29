import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import useCartStore from '../store/cartStore';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // State cho SP liên quan
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        // 1. Lấy chi tiết sản phẩm hiện tại
        const resProduct = await axiosClient.get(`products/${id}/`);
        setProduct(resProduct.data);

        // 2. Lấy danh sách tất cả sản phẩm để làm "Sản phẩm liên quan"
        // (Thực tế sau này có thể viết API lọc theo cùng Thể loại/Artist cho xịn hơn)
        const resAll = await axiosClient.get('products/');
        // Lọc bỏ sản phẩm hiện tại ra khỏi danh sách liên quan, lấy 4 cái đầu tiên
        const filtered = resAll.data.filter(p => p.id !== parseInt(id)).slice(0, 4);
        setRelatedProducts(filtered);
        
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Không tìm thấy sản phẩm này!');
      } finally {
        setLoading(false);
      }
    };
    
    // Cuộn lên đầu trang mỗi khi đổi sản phẩm
    window.scrollTo(0, 0);
    fetchProductAndRelated();
  }, [id]);

  const handleQtyChange = (type) => {
    if (type === 'increase' && qty < product.stock) {
      setQty(qty + 1);
    } else if (type === 'decrease' && qty > 1) {
      setQty(qty - 1);
    }
  };

  const addToCartHandler = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  if (loading) return <div className="text-center py-20 text-pink-500 font-bold min-h-screen bg-black">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-20 text-red-500 font-bold min-h-screen bg-black">{error}</div>;
  if (!product) return null;

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      
      {/* 1. BREADCRUMB (Đường dẫn điều hướng giống ảnh) */}
      <div className="bg-[#111] border-b border-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-3 text-[11px] md:text-xs text-gray-400 uppercase tracking-widest flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-pink-500 transition">Trang chủ</Link>
          <span>/</span>
          <span className="hover:text-pink-500 transition cursor-pointer">{product.artist_info?.name || 'ARCH CLUB'}</span>
          <span>/</span>
          <span className="text-white font-bold">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        
        {/* ================= PHẦN THÔNG TIN CHÍNH ================= */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 mb-16">
          
          {/* Cột Trái: Thư viện Ảnh */}
          <div className="w-full md:w-1/2">
            {/* Ảnh to */}
            <div className="aspect-square bg-[#0a0a0a] border border-gray-800 flex items-center justify-center p-4 mb-4 relative group">
              <img 
                src={`${product.image}`} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
              {/* Badge Hết hàng (Nếu có) */}
              {product.stock <= 0 && (
                <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs font-bold border border-gray-600 tracking-widest">
                  HẾT HÀNG
                </div>
              )}
            </div>

            {/* Ảnh nhỏ (Thumbnails) - Do Backend mình chỉ có 1 ảnh, tui sẽ map 1 ảnh này ra làm demo UI cho má */}
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              <div className="w-20 h-20 bg-[#0a0a0a] border-2 border-pink-500 flex-shrink-0 cursor-pointer p-1">
                <img src={`${product.image}`} className="w-full h-full object-cover opacity-100" />
              </div>
              {/* Giả lập thêm 2 ô trống cho giống giao diện nhiều ảnh */}
              {/* <div className="w-20 h-20 bg-[#111] border border-gray-800 flex-shrink-0 cursor-pointer p-1 opacity-50 hover:opacity-100 transition">
                <img src={`${product.image}`} className="w-full h-full object-cover grayscale" />
              </div> */}
            </div>
          </div>

          {/* Cột Phải: Thông tin chốt đơn */}
          <div className="w-full md:w-1/2 flex flex-col justify-start">
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2 text-white">
              {product.name}
            </h1>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-6">
              {product.artist_info?.name || 'ArchClub Official'}
            </p>

            {/* Trạng thái / Giá tiền */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div>
                  <div className="text-3xl font-bold text-pink-500 mb-2">
                    {Number(product.price).toLocaleString('vi-VN')} ₫
                  </div>
                  {/* --- ĐÂY LÀ DÒNG TUI MỚI THÊM VÀO ĐỂ HIỆN SỐ LƯỢNG KHO --- */}
                  <div className="text-[11px] font-bold tracking-widest uppercase">
                    <span className="text-gray-500">Tình trạng: </span>
                    <span className="text-green-500">Còn hàng ({product.stock} sản phẩm)</span>
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-gray-500 uppercase">Hết hàng</div>
              )}
            </div>

            {/* Đoạn text đỏ đỏ nghiêng nghiêng giống LP Club */}
            <div className="mb-8 space-y-2 text-sm italic text-pink-400/80">
              <p>* Sản phẩm chính hãng, nhập khẩu trực tiếp.</p>
              <p>* Các đơn hàng dự kiến được ship và trả tại cửa hàng từ 3-5 ngày làm việc.</p>
            </div>

            {/* Cụm Action: Số lượng + Nút Thêm */}
            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 border-t border-gray-800 pt-8 mt-auto">
                {/* Chỉnh số lượng */}
                <div className="flex items-center border border-gray-700 bg-black">
                  <button onClick={() => handleQtyChange('decrease')} className="px-5 py-3 text-gray-400 hover:text-pink-500 transition font-bold text-lg">
                    -
                  </button>
                  <span className="w-12 text-center font-bold text-white">{qty}</span>
                  <button onClick={() => handleQtyChange('increase')} className="px-5 py-3 text-gray-400 hover:text-pink-500 transition font-bold text-lg">
                    +
                  </button>
                </div>

                {/* Nút Đặt hàng */}
                <button 
                  onClick={addToCartHandler}
                  className="flex-grow bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 uppercase tracking-widest transition flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🛒</span> THÊM VÀO GIỎ
                </button>
              </div>
            )}
            
            {/* Nếu hết hàng thì hiện nút Disable */}
            {product.stock <= 0 && (
              <div className="border-t border-gray-800 pt-8 mt-auto">
                <button disabled className="w-full bg-[#111] text-gray-500 border border-gray-700 font-bold py-4 uppercase tracking-widest cursor-not-allowed">
                  SẢN PHẨM TẠM HẾT
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ================= TAB CHI TIẾT SẢN PHẨM ================= */}
        <div className="mb-20">
          <div className="border-b-2 border-gray-800 flex gap-8 mb-6">
            {/* Header của Tab */}
            <div className="pb-3 border-b-2 border-pink-500 -mb-[2px] text-pink-500 font-bold uppercase tracking-widest text-sm md:text-base">
              Chi tiết sản phẩm
            </div>
          </div>
          
          {/* Nội dung Tab */}
          <div className="bg-[#111] border border-gray-800 p-6 md:p-8 text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-sans">
            {product.description || 'Chưa có thông tin chi tiết cho sản phẩm này. Vui lòng quay lại sau!'}
          </div>
        </div>

        {/* ================= SẢN PHẨM ĐỀ XUẤT ================= */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="bg-[#111] text-pink-500 py-3 mb-6 border-y border-pink-500/30 flex items-center">
               <h2 className="text-lg font-bold tracking-widest uppercase pl-4 border-l-4 border-pink-500">
                 Sản phẩm liên quan
               </h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetail;