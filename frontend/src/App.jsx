import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login'; // Thêm dòng này
import Register from './pages/Register'; // Thêm dòng này, nhớ tạo file Register.jsx nữa nhé
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Footer from './components/Footer'; // <--- Thêm dòng này
import Search from './pages/Search'; // Thêm import
import Shop from './pages/Shop';
import VNPayReturn from './pages/VNPayReturn';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} /> {/* Thêm dòng này */}
            <Route path="/register" element={<Register />} /> {/* Thêm dòng này, nhớ import ở trên nữa nhé */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/vnpay-return" element={<VNPayReturn />} />
            {/* Mình sẽ làm trang Register và Checkout sau */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;