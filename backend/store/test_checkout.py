import pytest
from rest_framework.test import APIClient
from store.models import Product, Artist
from django.contrib.auth.models import User

@pytest.fixture
def setup_checkout_data():
    user = User.objects.create_user(username="testbuyer2", password="password123")
    artist, _ = Artist.objects.get_or_create(name="Ngọt", defaults={'slug': 'ngot'})
    product = Product.objects.create(name="Album 3", format="CD", artist=artist, price=250000, stock=10)
    return user, product

# BẢNG DATA-DRIVEN CHO FORM CHECKOUT
@pytest.mark.django_db
@pytest.mark.parametrize(
    "is_logged_in, order_items, address, payment_method, expected_status",
    [
        # --- HAPPY PATH ---
        (True, [{"qty": 1}], "123 Đường A", "COD", 201),
        (True, [{"qty": 1}], "123 Đường A", "VNPAY", 201),
        
        # --- AUTHENTICATION ---
        (False, [{"qty": 1}], "123 Đường A", "COD", 401),
        
        # --- MISSING FIELDS (Thiếu dữ liệu) ---
        (True, [], "123 Đường A", "COD", 400), # Rỗng Items
        (True, [{"qty": 1}], "", "COD", 400), # Rỗng địa chỉ
        (True, [{"qty": 1}], None, "COD", 400), # Null địa chỉ
        (True, [{"qty": 1}], "123 Đường A", "", 400), # Rỗng payment
        (True, [{"qty": 1}], "123 Đường A", "TIEN_MAT_GIAO_TAY", 400), # Payment method không tồn tại trong hệ thống
        
        # --- MALICIOUS PAYLOADS ---
        (True, [{"qty": -1}], "123 Đường A", "COD", 400), # Lồng số âm vào mảng
        (True, [{"qty": 1}], "<script>alert('hack_address')</script>", "COD", 400), # XSS vào địa chỉ
    ]
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