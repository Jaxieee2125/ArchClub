import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

// Component nhỏ để render cái thanh tiêu đề màu xanh cổ vịt
const SectionTitle = ({ title }) => (
  <div className="bg-[#111] text-pink-500 text-center py-2 mb-6 border-y border-gray-700">
    <h2 className="text-lg font-medium tracking-widest uppercase">{title}</h2>
  </div>
);

const bannerImages = [
  
  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000&auto=format&fit=crop"
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý ảnh Banner hiện tại
  const [currentBanner, setCurrentBanner] = useState(0);

  // Hiệu ứng tự động chuyển Banner sau mỗi 4 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 4000);
    return () => clearInterval(timer); // Xóa bộ đếm khi rời trang
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get('products/');
        setProducts(response.data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-black min-h-screen text-white pb-12">
      
      {/* Banner Đen Nghệ thuật */}
      <div className="w-full bg-[#0a0a0a] border-b border-gray-800 mb-8">
        <div className="container mx-auto max-w-7xl relative aspect-[21/9] md:aspect-[3/1] flex items-center overflow-hidden">
          {bannerImages.map((img, index) => (
            <img 
              key={index}
              src={img} 
              alt={`Banner ${index + 1}`} 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? 'opacity-50' : 'opacity-0'
              }`} 
            />
          ))}
          <div className="relative z-10 p-8 md:p-16">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-[0.2em] mb-4 uppercase text-white drop-shadow-lg">
              VINYL & CD <br /> COLLECTION
            </h2>
            <p className="text-sm md:text-lg tracking-widest text-gray-300 uppercase">
              Âm nhạc đích thực - Sưu tầm cực chất
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4">
        
        {/* SECTION: NEW ARRIVAL */}
        <SectionTitle title="NEW ARRIVAL" />
        {loading ? (
          <div className="text-center py-10 text-pink-500">Đang tải dữ liệu...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
            {products.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* SECTION: OUR PICKS */}
        <SectionTitle title="OUR PICKS" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {/* Tạm thời đảo ngược danh sách để demo, thực tế bạn có thể lọc SP Hot */}
          {products.slice(0, 5).reverse().map((product) => (
            <ProductCard key={`pick-${product.id}`} product={product} />
          ))}
        </div>

        {/* SECTION: BÀI VIẾT / VIDEO (Giống ảnh 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Cột trái: WATCHED THIS YET? */}
          <div>
            <SectionTitle title="WATCHED THIS YET?" />
            <Link to="https://www.youtube.com/watch?v=UT_6v4eI2AI" className="aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center hover:opacity-80 transition cursor-pointer">
              <img 
                src="https://bizweb.dktcdn.net/100/411/628/themes/804441/assets/1.jpg?1772133596477" 
                
                alt="Video Thumbnail" 
                className="w-full h-full object-cover"
              />
            </Link>
          </div>

          {/* Cột phải: COMING SOON */}
          <div>
            <SectionTitle title="COMING SOON" />
            <div className="aspect-video bg-gray-900 border border-gray-800 flex items-center justify-center hover:opacity-80 transition cursor-pointer">
              <img 
                src="https://bizweb.dktcdn.net/100/411/628/themes/804441/assets/g103.jpg?1772133596477" 
                alt="Coming Soon" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;