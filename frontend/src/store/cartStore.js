import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  // Lấy dữ liệu từ localStorage ra (nếu có), không thì mảng rỗng
  cartItems: JSON.parse(localStorage.getItem('cartItems')) || [],

  // Hàm tính tổng số lượng món hàng trong giỏ
  getTotalItems: () => {
    return get().cartItems.reduce((total, item) => total + item.qty, 0);
  },

  // Hàm tính tổng tiền
  getTotalPrice: () => {
    return get().cartItems.reduce((total, item) => total + Number(item.price) * item.qty, 0);
  },

  // Hành động: Thêm vào giỏ
  addToCart: (product, qty) => {
    const currentCart = get().cartItems;
    const existItem = currentCart.find((x) => x.product_id === product.id);

    let newCart;
    if (existItem) {
      // Nếu hàng đã có trong giỏ, cộng dồn số lượng nhưng không được vượt quá tồn kho (stock)
      newCart = currentCart.map((x) =>
        x.product_id === existItem.product_id
          ? { ...existItem, qty: Math.min(existItem.qty + qty, product.stock) }
          : x
      );
    } else {
      // Nếu là hàng mới
      newCart = [...currentCart, {
        product_id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
        artist: product.artist_info?.name || 'ArchClub',
        qty: qty
      }];
    }

    // Cập nhật State và lưu vào LocalStorage
    set({ cartItems: newCart });
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  },

  // Hành động: Xóa khỏi giỏ
  removeFromCart: (id) => {
    const newCart = get().cartItems.filter((x) => x.product_id !== id);
    set({ cartItems: newCart });
    localStorage.setItem('cartItems', JSON.stringify(newCart));
  },

  // THÊM ĐOẠN NÀY VÀO: Hành động làm sạch giỏ sau khi đặt hàng
  clearCart: () => {
    set({ cartItems: [] });
    localStorage.removeItem('cartItems');
  },
}));

  

export default useCartStore;