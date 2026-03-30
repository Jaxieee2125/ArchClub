import pytest
import json
import os
from rest_framework.test import APIClient
from store.models import Order
from django.contrib.auth.models import User

# ---------------------------------------------------------
# HÀM ĐỌC DỮ LIỆU TỪ FILE JSON
# ---------------------------------------------------------
def load_test_data():
    file_path = os.path.join(os.path.dirname(__file__), 'data_vnpay.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return [
        (
            item['response_code'], 
            item['transaction_status'], 
            item['expected_api_status'], 
            item['expected_msg']
        ) for item in data
    ]

# ---------------------------------------------------------

@pytest.fixture
def setup_vnpay_order():
    user = User.objects.create_user(username="vnpayuser", password="123")
    order = Order.objects.create(user=user, total_price=1000000, is_paid=False)
    return order

# BẢNG DATA-DRIVEN ĐÃ ĐƯỢC TÁCH RA FILE JSON
@pytest.mark.django_db
@pytest.mark.parametrize(
    "response_code, transaction_status, expected_api_status, expected_msg",
    load_test_data() # Nạp kịch bản từ file JSON
)
def test_vnpay_return_logic_ddt(setup_vnpay_order, response_code, transaction_status, expected_api_status, expected_msg):
    order = setup_vnpay_order
    client = APIClient()
    url = f'/api/orders/vnpay-return/?vnp_TxnRef={order.id}&vnp_ResponseCode={response_code}&vnp_TransactionStatus={transaction_status}'
    response = client.get(url)
    
    assert response.status_code == expected_api_status
    
    # Đã bổ sung hàm Assert này để kiểm tra xem Backend trả về text có đúng không
    assert expected_msg in response.data.get('message', '') or expected_msg in response.data.get('error', '')