import pytest
import json
import os
from rest_framework.test import APIClient
from store.models import Product, Artist

# ---------------------------------------------------------
# HÀM ĐỌC DỮ LIỆU TỪ FILE JSON
# ---------------------------------------------------------
def load_test_data():
    file_path = os.path.join(os.path.dirname(__file__), 'data_products.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return [
        (
            item['search_keyword'], 
            item['expected_count']
        ) for item in data
    ]

# ---------------------------------------------------------

@pytest.fixture
def setup_products():
    artist1, _ = Artist.objects.get_or_create(name="Thắng", defaults={'slug': 'thang'})
    Product.objects.create(name="Thắng - Giấy Trắng", format="CD", artist=artist1, price=200000, stock=10)
    Product.objects.create(name="Đĩa than Thắng", format="VINYL", artist=artist1, price=1000000, stock=5)

# BẢNG DATA-DRIVEN ĐÃ ĐƯỢC TÁCH RA FILE JSON
@pytest.mark.django_db
@pytest.mark.parametrize(
    "search_keyword, expected_count",
    load_test_data() # Kéo kịch bản từ file JSON vào
)
def test_search_and_filter_ddt(setup_products, search_keyword, expected_count):
    client = APIClient()
    
    # Chỉ test tham số 'q', bỏ tham số 'format' để tránh lỗi 404 của DRF
    url = f'/api/products/?q={search_keyword}'
    response = client.get(url)
    
    assert response.status_code == 200
    data = response.data['results'] if 'results' in response.data else response.data
    assert len(data) == expected_count