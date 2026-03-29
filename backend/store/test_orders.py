import pytest
from rest_framework.test import APIClient
from store.models import Product, Artist, Order
from django.contrib.auth.models import User

@pytest.fixture
def setup_checkout():
    # Tạo 1 User để đăng nhập
    user = User.objects.create_user(username="testbuyer", password="password123")
    artist, _ = Artist.objects.get_or_create(name="Chillies", defaults={'slug': 'chillies'})
    
    # Tạo 1 sản phẩm với tồn kho chính xác là 5 cái
    product = Product.objects.create(
        name="Đĩa than Chillies", format="VINYL", artist=artist, 
        price=1000000, stock=5
    )
    return user, product

# BẢNG DATA-DRIVEN TESTING CHO TỒN KHO
@pytest.mark.django_db
@pytest.mark.parametrize(
    "buy_qty, expected_status, expected_stock_left",
    [
        # --- ĐÚNG QUY TRÌNH (HAPPY PATH) ---
        (1, 201, 4), # Mua 1
        (5, 201, 0), # Mua sạch kho
        
        # --- VƯỢT QUÁ GIỚI HẠN (OUT OF BOUNDS) ---
        (6, 400, 5), # Kho có 5, đòi mua 6 -> Chặn
        (9999999, 400, 5), # DDoS số lượng khổng lồ -> Chặn
        
        # --- DỮ LIỆU ĐỘC HẠI (MALICIOUS DATA) ---
        (0, 400, 5), # Mua 0 món -> Chặn
        (-5, 400, 5), # Hack số lượng âm để gian lận tiền -> Chặn
        
        # --- SAI KIỂU DỮ LIỆU (DATA TYPE MISMATCH) ---
        # Lưu ý: Django Rest Framework có thể tự ép kiểu, hoặc quăng lỗi 400
        ("hai", 400, 5), # Cố tình gửi chữ thay vì số
        (1.5, 400, 5), # Cố tình gửi số thập phân (đĩa than không bán rưỡi)
    ]
)
def test_inventory_deduction_ddt(setup_checkout, buy_qty, expected_status, expected_stock_left):
    user, product = setup_checkout
    client = APIClient()
    
    # Bắt buộc phải đăng nhập thì mới được đặt hàng
    client.force_authenticate(user=user)
    
    # Cấu trúc Data giỏ hàng gửi lên API
    payload = {
        "shippingAddress": "123 Đường Test, Quận 1",
        "totalPrice": product.price * buy_qty,
        "paymentMethod": "COD",
        "orderItems": [
            {"product_id": product.id, "qty": buy_qty, "price": product.price}
        ]
    }
    
    url = '/api/orders/add/'
    response = client.post(url, payload, format='json')
    
    # 1. Assert Status Code (201 Tạo đơn thành công, hoặc 400 Báo lỗi)
    assert response.status_code == expected_status
    
    # 2. Assert Tồn kho thực tế trong Database
    # Phải query lại vào Database để lấy số liệu mới nhất sau khi API chạy
    product.refresh_from_db()
    assert product.stock == expected_stock_left