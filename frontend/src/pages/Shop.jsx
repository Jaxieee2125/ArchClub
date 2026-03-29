import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';


const Shop = () => {
  // eslint-disable-next-line no-unused-vars
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // THÊM ĐOẠN NÀY ĐỂ ĐỌC URL:
  const [searchParams] = useSearchParams();
  const formatFromUrl = searchParams.get('product_format');

  // States cho Bộ lọc
  const [selectedFormats, setSelectedFormats] = useState(formatFromUrl ? [formatFromUrl.toUpperCase()] : []);
  const [selectedArtists, setSelectedArtists] = useState([]);
  
  // Lấy danh sách nghệ sĩ độc nhất (Unique Artists) từ data
  const [availableArtists, setAvailableArtists] = useState([]);

  // Danh sách định dạng (Format) giả lập
  const availableFormats = ['CD', 'VINYL', 'CASSETTE', 'MERCH', 'BY AC', 'GEAR', 'SALE', 'RESTOCK', 'OTHER'];

  useEffect(() => {
    const format = searchParams.get('product_format');
    if (format) {
      setSelectedFormats([format.toUpperCase()]);
    } else {
      // Nếu bấm nút "ALL" (không có tham số) thì xóa bộ lọc định dạng
      setSelectedFormats([]); 
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axiosClient.get('products/');
        setAllProducts(data);
        setFilteredProducts(data);
        
        // Trích xuất danh sách Nghệ sĩ không trùng lặp
        const artists = [...new Set(data.map(p => p.artist_info?.name).filter(Boolean))];
        setAvailableArtists(artists);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Logic Lọc Sản phẩm mỗi khi Checkbox thay đổi
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        // Tạo chuỗi query URL dựa trên Checkbox
        const params = new URLSearchParams();
        
        if (selectedFormats.length > 0) {
          params.append('product_format', selectedFormats.join(','));
        }
        if (selectedArtists.length > 0) {
          params.append('artist', selectedArtists.join(','));
        }

        // Gọi API với các filter
        const { data } = await axiosClient.get(`products/?${params.toString()}`);
        setFilteredProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedFormats, selectedArtists]); // Chạy lại mỗi khi tick/bỏ tick checkbox

  // Hàm xử lý khi tick chọn Checkbox
  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter(item => item !== value)); // Bỏ tick
    } else {
      setState([...state, value]); // Tick vào
    }
  };

  let pageTitle = "Tất cả sản phẩm";
  if (selectedFormats.length > 0 || selectedArtists.length > 0) {
    const parts = [];
    if (selectedFormats.length > 0) parts.push(selectedFormats.join(', '));
    if (selectedArtists.length > 0) parts.push(selectedArtists.join(', '));
    pageTitle = parts.join(' - ');
  }

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* Breadcrumb */}
      <div className="bg-[#111] border-b border-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-3 text-[11px] uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Link to="/" className="hover:text-pink-500 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-white font-bold">{pageTitle}</span>
        </div>
      </div>

      {/* Banner Đẹp (Giống LP Club) */}
      <div className="container mx-auto max-w-7xl px-4 mt-8">
        <div className="w-full aspect-[4/1] bg-[#111] border border-gray-800 relative overflow-hidden flex items-end justify-center">
          <img 
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop" 
            alt="Shop Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="relative z-10 w-full bg-pink-600 py-3 text-center">
            <p className="text-white font-black uppercase tracking-widest text-sm md:text-base">
              FREESHIP CHO ĐƠN HÀNG TRÊN 2.500.000 VNĐ. NHẬP MÁ 'FREES2' LÚC THANH TOÁN
            </p>
          </div>
        </div>
      </div>

      {/* Nội dung chính: Cột trái (Filter) - Cột phải (Products) */}
      <div className="container mx-auto max-w-7xl px-4 py-12 flex flex-col md:flex-row gap-8">
        
        {/* ========= SIDEBAR BỘ LỌC (Trái) ========= */}
        <div className="w-full md:w-1/4 flex-shrink-0">
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 pb-4 border-b border-gray-800">
            Bộ Lọc
          </h2>

          {/* Block Lọc: Định dạng */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Định dạng</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {availableFormats.map(format => (
                <label key={format} className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedFormats.includes(format)}
                    onChange={() => handleCheckboxChange(format, selectedFormats, setSelectedFormats)}
                    className="w-4 h-4 accent-pink-500 bg-black border-gray-700 rounded-sm cursor-pointer"
                  />
                  <span className={`text-sm font-medium uppercase transition ${selectedFormats.includes(format) ? 'text-pink-500 font-bold' : 'text-gray-300 group-hover:text-white'}`}>
                    {format}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Block Lọc: Nghệ sĩ */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Nghệ sĩ</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 border-l border-gray-800 pl-4">
              {availableArtists.map(artist => (
                <label key={artist} className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedArtists.includes(artist)}
                    onChange={() => handleCheckboxChange(artist, selectedArtists, setSelectedArtists)}
                    className="w-4 h-4 accent-pink-500 bg-black border-gray-700 rounded-sm cursor-pointer"
                  />
                  <span className={`text-sm font-medium uppercase transition ${selectedArtists.includes(artist) ? 'text-pink-500 font-bold' : 'text-gray-300 group-hover:text-white'}`}>
                    {artist}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ========= DANH SÁCH SẢN PHẨM (Phải) ========= */}
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
            <h1 className="text-xl font-black uppercase tracking-widest line-clamp-1">
              {pageTitle}
            </h1>
            <span className="text-sm text-gray-500 font-bold">
              {filteredProducts.length} KẾT QUẢ
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-pink-500 font-bold uppercase tracking-widest">Đang tải dữ liệu...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center border border-gray-800 bg-[#0a0a0a]">
              <p className="text-gray-500 uppercase tracking-widest mb-4">Không có sản phẩm nào phù hợp với bộ lọc.</p>
              <button 
                onClick={() => { setSelectedArtists([]); setSelectedFormats([]); }}
                className="bg-pink-500 text-white px-6 py-2 uppercase text-xs font-bold hover:bg-white hover:text-black transition"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;