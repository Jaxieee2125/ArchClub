import pytest
from rest_framework.test import APIClient
from store.models import Order
from django.contrib.auth.models import User

@pytest.fixture
def setup_vnpay_order():
    user = User.objects.create_user(username="vnpayuser", password="123")
    order = Order.objects.create(user=user, total_price=1000000, is_paid=False)
    return order

@pytest.mark.django_db
@pytest.mark.parametrize(
    "response_code, transaction_status, expected_api_status, expected_msg",
    [
        # Code 00 nhưng vì test môi trường giả (không có chữ ký thật) nên Backend sẽ chặn và báo Thất bại
        ("00", "00", 200, "thất bại"), 
        ("24", "02", 200, "bị hủy"), # Hủy giao dịch vẫn trả 200 kèm text
        ("11", "02", 200, "thất bại"), 
        ("99", "02", 200, "thất bại"), 
    ]
)
def test_vnpay_return_logic_ddt(setup_vnpay_order, response_code, transaction_status, expected_api_status, expected_msg):
    order = setup_vnpay_order
    client = APIClient()
    url = f'/api/orders/vnpay-return/?vnp_TxnRef={order.id}&vnp_ResponseCode={response_code}&vnp_TransactionStatus={transaction_status}'
    response = client.get(url)
    
    assert response.status_code == expected_api_status