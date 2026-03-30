import pytest
import json
import os
from rest_framework.test import APIClient
from store.models import Product, Artist
from django.contrib.auth.models import User

# ---------------------------------------------------------
# HÀM ĐỌC DỮ LIỆU TỪ FILE JSON
# ---------------------------------------------------------
def load_test_data():
    file_path = os.path.join(os.path.dirname(__file__), 'data_checkout.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Trích xuất các tham số từ JSON (bỏ qua cột description)
    return [
        (
            item['is_logged_in'], 
            item['order_items'], 
            item['address'], 
            item['payment_method'], 
            item['expected_status']
        ) for item in data
    ]

# ---------------------------------------------------------

@pytest.fixture
def setup_checkout_data():
    user = User.objects.create_user(username="testbuyer2", password="password123")
    artist, _ = Artist.objects.get_or_create(name="Ngọt", defaults={'slug': 'ngot'})
    product = Product.objects.create(name="Album 3", format="CD", artist=artist, price=250000, stock=10)
    return user, product

# BẢNG DATA-DRIVEN ĐÃ ĐƯỢC TÁCH RA FILE JSON
@pytest.mark.django_db
@pytest.mark.parametrize(
    "is_logged_in, order_items, address, payment_method, expected_status",
    load_test_data() # Gọi dữ liệu lên tự động
)
def test_checkout_validation_ddt(setup_checkout_data, is_logged_in, order_items, address, payment_method, expected_status):
    user, product = setup_checkout_data
    client = APIClient()
    
    # Giả lập trạng thái đăng nhập
    if is_logged_in:
        client.force_authenticate(user=user)
        
    # Gắn ID sản phẩm thực tế vào mảng order_items giả lập
    for item in order_items:
        item["product_id"] = product.id
        item["price"] = product.price

    payload = {
        "shippingAddress": address,
        "totalPrice": 250000,
        "paymentMethod": payment_method,
        "orderItems": order_items
    }
    
    url = '/api/orders/add/'
    response = client.post(url, payload, format='json')
    
    assert response.status_code == expected_status