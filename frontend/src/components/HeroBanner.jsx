import { Link } from 'react-router-dom';

const HeroBanner = () => {
  return (
    <div className="relative bg-gray-900 h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      {/* Ảnh nền mờ (Bạn có thể thay link ảnh idol tùy thích) */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: "url('https://a-static.besthdwallpaper.com/blackpink-girl-group-members-rose-lisa-jennie-jisoo-wallpaper-1440x1080-105895_22.jpg?q=80&w=2000&auto=format&fit=crop')" }}
      ></div>

      {/* Nội dung Banner */}
      <div className="relative z-10 text-center px-4 max-w-3xl">
        <span className="uppercase tracking-[0.3em] text-pink-500 font-bold text-sm mb-4 block">
          ArchClub Exclusive
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          SỞ HỮU MERCH CHÍNH HÃNG <br /> TỪ IDOL CỦA BẠN
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Album, Lightstick, Photocard và các bộ sưu tập giới hạn mới nhất đang chờ bạn khám phá.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-pink-500 hover:bg-white hover:text-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-500/50"
        >
          Khám phá ngay
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;