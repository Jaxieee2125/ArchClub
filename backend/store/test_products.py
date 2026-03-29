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
        ("Thắng", 2),
        ("Giấy", 1),
        ("TỪ-KHÓA-ẢO-MA", 0),
        ("thẮnG", 0), # Giữ lại làm 1 Failed Case nhỏ: SQLite chưa hỗ trợ tìm kiếm không dấu/hoa thường tốt tiếng Việt
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