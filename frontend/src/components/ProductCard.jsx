import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.image 
    ? (product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000${product.image}`)
    : 'https://placehold.co/400x400/1l11111/ec4899?text=ARCHCLUB'; // Ảnh mặc định màu đen hồng cực ngầu
  return (
    <div className="bg-black border border-gray-800 group h-full flex flex-col">
      {/* Khung ảnh: Vuông vức, nền trắng để nổi bật đĩa CD/Áo */}
      <div className="relative aspect-square bg-white overflow-hidden p-2 flex items-center justify-center">
        <Link to={`/product/${product.id}`} className="w-full h-full flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={product.name}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badge Hết Hàng góc cạnh */}
        {product.stock <= 0 && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 tracking-wider">
            SOLD OUT
          </span>
        )}
      </div>
      
      {/* Thông tin sản phẩm: Chữ trắng, căn giữa */}
      <div className="p-3 flex flex-col flex-grow text-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
          {product.artist_info?.name || 'ARCH CLUB'}
        </p>
        <Link to={`/product/${product.id}`} className="flex-grow">
          <h3 className="text-sm font-medium text-white line-clamp-2 hover:text-pink-500 transition-colors uppercase">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 text-sm font-bold text-pink-500">
          {Number(product.price).toLocaleString('vi-VN')} ₫
        </div>
      </div>
    </div>
  );
};

export default ProductCard;