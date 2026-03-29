const Footer = () => {
  return (
    <footer className="bg-[#111111] text-gray-400 font-sans border-t-[1px] border-gray-800">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-800 pb-8">
          
          {/* Cột trái: Thông tin liên hệ */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-widest">ARCH CLUB</h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs text-white">📍</div>
              <span className="text-sm">236A Lê Văn Sỹ, Quận Tân Bình, TPHCM</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs text-white">🕒</div>
              <span className="text-sm">7:00 - 20:00 hằng ngày</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs text-white">📞</div>
              <span className="text-sm">033 6666 999</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center text-xs text-white">✉️</div>
              <span className="text-sm">archclub@gmail.com</span>
            </div>
          </div>

          {/* Cột phải: Để trống hoặc chèn Fanpage Facebook sau này */}
          <div className="hidden md:block border-l border-gray-800 pl-8">
             {/* Fanpage Plugin có thể đặt ở đây */}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-6 text-xs text-gray-500">
          <p>© 2026 - ARCHCLUB</p>
          <p>Bản quyền thuộc về ARCHCLUB</p>
        </div>
      </div>
      
      {/* Thanh xanh cổ vịt dưới cùng */}
      
    </footer>
  );
};

export default Footer;