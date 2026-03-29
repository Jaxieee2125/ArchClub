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
        # --- EQUIVALENCE PARTITIONING (Các vùng dữ liệu) ---
        (1, 201, 4), # Vùng hợp lệ (Valid)
        (5, 201, 0), # Vùng biên cực đại (Max valid)
        (6, 400, 5), # Vùng không hợp lệ (Invalid - Over stock)
        
        # --- NEGATIVE TESTING (Hack số lượng) ---
        (0, 400, 5), # Mua 0 món
        (-1, 400, 5), # Mua số âm
        (-9999, 400, 5), # Âm khổng lồ
        
        # --- DATA TYPE MISMATCH (Sai kiểu dữ liệu) ---
        ("một", 400, 5), # Chữ tiếng Việt
        ("1", 201, 4), # Chữ dạng số (Backend DRF phải tự ép kiểu được)
        (1.5, 400, 5), # Số thập phân (Float)
        (True, 400, 5), # Boolean
        (None, 400, 5), # Dữ liệu rỗng (Null)
        
        # --- OVERFLOW TESTING (Tràn bộ nhớ) ---
        (999999999999999999, 400, 5), # Tràn số nguyên
    ]
)
def test_inventory_deduction_ddt(setup_checkout, buy_qty, expected_status, expected_stock_left):
    user, product = setup_checkout
    client = APIClient()
    
    # Bắt buộc phải đăng nhập thì mới được đặt hàng
    client.force_authenticate(user=user)
    
    try:
        total_price = product.price * int(buy_qty)
    except (ValueError, TypeError):
        total_price = 0
    
    # Cấu trúc Data giỏ hàng gửi lên API
    payload = {
        "shippingAddress": "123 Đường Test, Quận 1",
        "totalPrice": total_price,
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