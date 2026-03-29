import pytest
from rest_framework.test import APIClient
from store.models import Product, Artist

@pytest.fixture
def setup_products():
    artist1, _ = Artist.objects.get_or_create(name="Thắng", defaults={'slug': 'thang'})
    Product.objects.create(name="Thắng - Giấy Trắng", format="CD", artist=artist1, price=200000, stock=10)
    Product.objects.create(name="Đĩa than Thắng", format="VINYL", artist=artist1, price=1000000, stock=5)

@pytest.mark.django_db
@pytest.mark.parametrize(
    "search_keyword, expected_count",
    [
        # --- TÌM KIẾM CƠ BẢN ---
        ("Thắng", 2),
        ("Giấy", 1),
        
        # --- ĐA NGÔN NGỮ & UNICODE ---
        ("Thắng", 2), # Có dấu
        ("thang", 2), # Không dấu (Tuỳ thuộc Database setup)
        ("オタク", 0), # Tiếng Nhật
        ("😊🎵", 0), # Emoji
        
        # --- STRING FORMATTING ---
        ("  Thắng  ", 2), # Dư khoảng trắng
        ("ThắNg", 2), # Bất quy tắc hoa thường
        
        # --- SECURITY & SPECIAL CHARS ---
        ("%", 0), # Wildcard SQL (Tránh việc nó load toàn bộ DB)
        ("_", 0), # Wildcard SQL
        ("'", 0), # Nháy đơn (Hay gây lỗi 500 nếu query thuần)
        ('"', 0), # Nháy kép
        ("\\", 0), # Ký tự escape
        ("<img src=x onerror=alert('hack')>", 0), # XSS
        
        # --- STRESS TESTING TÌM KIẾM ---
        ("a" * 1000, 0), # Gõ chuỗi dài 1000 ký tự xem có sập không
        ("", 2), # Chuỗi rỗng -> load tất cả
    ]
)
def test_search_and_filter_ddt(setup_products, search_keyword, expected_count):
    client = APIClient()
    # Chỉ test tham số 'q', bỏ tham số 'format' để tránh lỗi 404 của DRF
    url = f'/api/products/?q={search_keyword}'
    response = client.get(url)
    
    assert response.status_code == 200
    data = response.data['results'] if 'results' in response.data else response.data
    assert len(data) == expected_count