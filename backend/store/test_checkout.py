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
        # --- HAPPY PATH (Mọi thứ hoàn hảo) ---
        (True, [{"qty": 1}], "123 Đường A, Quận 1", "COD", 201), 
        
        # --- AUTHENTICATION (Bảo mật tài khoản) ---
        (False, [{"qty": 1}], "123 Đường A, Quận 1", "COD", 401), # Chưa đăng nhập mà dám gọi API tạo đơn -> Chặn (401 Unauthorized)
        
        # --- VALIDATION (Thiếu dữ liệu bắt buộc) ---
        (True, [], "123 Đường A, Quận 1", "COD", 400), # Giỏ hàng trống rỗng -> Chặn (400 Bad Request)
        (True, [{"qty": 1}], "", "COD", 400), # Không nhập địa chỉ giao hàng -> Chặn
        (True, [{"qty": 1}], "123 Đường A, Quận 1", "", 400), # Không chọn phương thức thanh toán -> Chặn
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