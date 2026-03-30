import pytest
import json
import os
from rest_framework.test import APIClient
from store.models import Product, Artist, Order
from django.contrib.auth.models import User

# ---------------------------------------------------------
# HÀM ĐỌC DỮ LIỆU TỪ FILE JSON
# ---------------------------------------------------------
def load_test_data():
    file_path = os.path.join(os.path.dirname(__file__), 'data_orders.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return [
        (
            item['buy_qty'], 
            item['expected_status'], 
            item['expected_stock_left']
        ) for item in data
    ]

# ---------------------------------------------------------

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

# BẢNG DATA-DRIVEN ĐÃ ĐƯỢC TÁCH RA FILE JSON
@pytest.mark.django_db
@pytest.mark.parametrize(
    "buy_qty, expected_status, expected_stock_left",
    load_test_data() # Nạp kịch bản từ file ngoài vào
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
    product.refresh_from_db()
    assert product.stock == expected_stock_left