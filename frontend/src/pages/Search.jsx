import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  const fetchSearchResults = async (keyword) => {
    if (!keyword) return;
    setLoading(true);
    try {
      const { data } = await axiosClient.get(`products/?q=${keyword}`);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(query);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    }
  };

  return (
    <div className="bg-black min-h-screen text-white pb-20">
      {/* 1. Breadcrumb */}
      <div className="bg-[#111] border-b border-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-3 text-[11px] uppercase tracking-widest text-gray-400 flex items-center gap-2">
          <Link to="/" className="hover:text-pink-500 transition">Trang chủ</Link>
          <span>/</span>
          <span className="text-white font-bold">Tìm kiếm</span>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-black uppercase tracking-[0.1em] mb-8">
          Kết quả tìm kiếm với từ khóa "<span className="text-pink-500">{query}</span>":
        </h1>

        {/* 2. Ô Search phụ (Giống trong ảnh) */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-12 max-w-xl">
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-grow bg-[#111] border border-gray-800 p-3 text-sm outline-none focus:border-pink-500 transition"
            placeholder="Nhập từ khóa..."
          />
          <button type="submit" className="bg-white text-black px-8 py-3 font-bold uppercase text-xs hover:bg-pink-500 hover:text-white transition">
            Tìm kiếm
          </button>
        </form>

        {/* 3. Danh sách kết quả */}
        {loading ? (
          <div className="text-pink-500 font-bold tracking-widest uppercase">Đang tìm kiếm...</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center border border-gray-800 bg-[#0a0a0a]">
            <p className="text-gray-500 uppercase tracking-widest">Không tìm thấy sản phẩm nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;