import pytest
from rest_framework.test import APIClient
from store.models import Coupon
from django.utils import timezone
from datetime import timedelta

# 1. SETUP: Tạo dữ liệu giả lập (Mock Data) trong Test Database
@pytest.fixture
def setup_data():
    # Mã FREES2: Giảm 30k, đơn tối thiểu 2.5 củ, còn hạn 1 năm
    Coupon.objects.create(
        code="FREES2", discount_value=30000, is_percentage=False, 
        min_order_value=2500000, valid_to=timezone.now() + timedelta(days=365), active=True
    )
    # Mã NEWBIE10: Giảm 10%, không yêu cầu tối thiểu, còn hạn 30 ngày
    Coupon.objects.create(
        code="NEWBIE10", discount_value=10, is_percentage=True, 
        min_order_value=0, valid_to=timezone.now() + timedelta(days=30), active=True
    )
    # Mã TET2026: Đã hết hạn (lùi lại 1 ngày)
    Coupon.objects.create(
        code="TET2026", discount_value=50000, is_percentage=False, 
        min_order_value=0, valid_to=timezone.now() - timedelta(days=1), active=True
    )

# 2. DATA-DRIVEN: Bảng dữ liệu đầu vào (Input) & Kết quả mong đợi (Expected)
# PyTest sẽ tự động nhặt từng dòng trong mảng này để chạy test
@pytest.mark.django_db
@pytest.mark.parametrize(
    "code, cart_total, expected_status, expected_discount, expected_message",
    [
        ("FREES2", 2500000, 200, 30000, "Áp dụng mã thành công!"), 
        ("FREES2", 2499999, 400, 0, "Đơn hàng tối thiểu phải từ 2,500,000đ!"), 
        ("NEWBIE10", -500000, 400, 0, "Đơn hàng tối thiểu phải từ 0đ!"), # Đã sửa lại Expected Message
        ("FREES2", 3000000, 200, 30000, "Áp dụng mã thành công!"),
        # Cố tình để dư khoảng trắng để test xem Backend có hàm strip() không. 
        # CÁI NÀY SẼ BỊ FAILED -> Báo cáo vào đồ án: "Lỗi thiếu hàm cắt khoảng trắng (strip)".
        (" FrEEs2  ", 3000000, 200, 30000, "Áp dụng mã thành công!"), 
    ]
)
def test_verify_coupon_ddt(setup_data, code, cart_total, expected_status, expected_discount, expected_message):
    """
    Hàm Test Logic: Chỉ viết 1 lần, nhưng sẽ tự động lặp lại 6 lần 
    tương ứng với 6 dòng dữ liệu (Test Cases) ở trên.
    """
    client = APIClient()
    url = '/api/orders/apply-coupon/'
    
    # Bơm Data (Input) vào Request gửi lên API
    response = client.post(url, {
        'code': code,
        'cart_total': cart_total
    }, format='json')
    
    # Đối chiếu (Assert): Kiểm tra Kết quả thực tế có giống với Kết quả mong đợi không
    assert response.status_code == expected_status
    
    if expected_status == 200:
        # Nếu thành công, kiểm tra xem tính tiền giảm có đúng không
        assert response.data['discount_amount'] == expected_discount
        assert response.data['message'] == expected_message
    else:
        # Nếu thất bại, kiểm tra câu báo lỗi có chuẩn không
        assert response.data['error'] == expected_message