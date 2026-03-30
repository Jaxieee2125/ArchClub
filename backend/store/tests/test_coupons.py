import pytest
import json
import os
from rest_framework.test import APIClient
from store.models import Coupon
from django.utils import timezone
from datetime import timedelta

# ---------------------------------------------------------
# HÀM ĐỌC DỮ LIỆU TỪ FILE JSON
# ---------------------------------------------------------
def load_test_data():
    file_path = os.path.join(os.path.dirname(__file__), 'data_coupons.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return [
        (
            item['code'], 
            item['cart_total'], 
            item['expected_status'], 
            item['expected_discount'], 
            item['expected_message']
        ) for item in data
    ]

# ---------------------------------------------------------

# 1. SETUP: Tạo dữ liệu giả lập (Mock Data) trong Test Database
@pytest.fixture
def setup_data():
    Coupon.objects.create(
        code="FREES2", discount_value=30000, is_percentage=False, 
        min_order_value=2500000, valid_to=timezone.now() + timedelta(days=365), active=True
    )
    Coupon.objects.create(
        code="NEWBIE10", discount_value=10, is_percentage=True, 
        min_order_value=0, valid_to=timezone.now() + timedelta(days=30), active=True
    )
    Coupon.objects.create(
        code="TET2026", discount_value=50000, is_percentage=False, 
        min_order_value=0, valid_to=timezone.now() - timedelta(days=1), active=True
    )

# 2. DATA-DRIVEN ĐÃ ĐƯỢC TÁCH RA FILE JSON
@pytest.mark.django_db
@pytest.mark.parametrize(
    "code, cart_total, expected_status, expected_discount, expected_message",
    load_test_data() # Gọi hàm bốc data từ JSON
)
def test_verify_coupon_ddt(setup_data, code, cart_total, expected_status, expected_discount, expected_message):
    client = APIClient()
    url = '/api/orders/apply-coupon/'
    
    response = client.post(url, {
        'code': code,
        'cart_total': cart_total
    }, format='json')
    
    assert response.status_code == expected_status
    
    if expected_status == 200:
        assert response.data['discount_amount'] == expected_discount
        assert response.data['message'] == expected_message
    else:
        assert expected_message in response.data.get('error', '')