import os
import django
from django.utils import timezone
from datetime import timedelta
from django.utils.text import slugify # <--- IMPORT THÊM CÔNG CỤ TẠO SLUG

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from store.models import Product, Coupon, Artist 
from django.contrib.auth.models import User

def run_seed():
    print("🧹 Đang dọn dẹp dữ liệu cũ (Sản phẩm, Nghệ sĩ & Mã giảm giá)...")
    Product.objects.all().delete()
    Artist.objects.all().delete() 
    Coupon.objects.all().delete()

    print("💿 Đang tạo Danh sách Sản phẩm mẫu...")
    products = [
        {"name": "Thắng - Giấy Trắng EP", "format": "CD", "artist": "Thắng", "price": 200000, "stock": 50, "description": "EP Giấy Trắng của Thắng."},
        {"name": "Ngọt - 3 (Tuyển tập nhạc Ngọt)", "format": "CASSETTE", "artist": "Ngọt", "price": 250000, "stock": 20, "description": "Album thứ 3 của Ngọt."},
        {"name": "Vũ. - Một Vạn Năm", "format": "VINYL", "artist": "Vũ.", "price": 1200000, "stock": 10, "description": "Đĩa than Một Vạn Năm cực hiếm."},
        {"name": "Đen Vâu - Lối Nhỏ", "format": "VINYL", "artist": "Đen Vâu", "price": 1500000, "stock": 5, "description": "Đĩa than chill cùng Đen."},
        {"name": "Chillies - Qua Khung Cửa Sổ", "format": "CD", "artist": "Chillies", "price": 180000, "stock": 0, "description": "Sản phẩm đã bán hết."},
        {"name": "Áo thun ArchClub Logo (Đen)", "format": "MERCH", "artist": "ArchClub", "price": 350000, "stock": 100, "description": "Áo thun local brand xịn xò."},
        {"name": "Mâm đĩa than Audio-Technica LP60X", "format": "GEAR", "artist": "Audio-Technica", "price": 4500000, "stock": 3, "description": "Mâm đĩa than quốc dân."},
    ]
    
    for p in products:
        artist_name = p.pop('artist')
        
        # 1. Tự động chuyển tên thành slug (VD: "Đen Vâu" -> "den-vau")
        artist_slug = slugify(artist_name)
        
        # 2. Truyền cái slug đó vào 'defaults' để Django lưu vào Database
        artist_obj, created = Artist.objects.get_or_create(
            name=artist_name,
            defaults={'slug': artist_slug}
        )
        
        p['artist'] = artist_obj
        
        # (Dự phòng): Nếu bảng Product của bạn CŨNG bắt buộc có slug, thì bỏ comment dòng dưới này:
        # p['slug'] = slugify(p['name'])
        
        Product.objects.create(**p)

    print("🎫 Đang tạo các Mã giảm giá phục vụ Test Case...")
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

    if not User.objects.filter(username="testuser").exists():
        print("👤 Đang tạo User Test (username: testuser / pass: 123456)...")
        User.objects.create_user(username="testuser", email="test@archclub.vn", password="123456")

    print("✅ BÙM! DỮ LIỆU ĐÃ ĐƯỢC BƠM THÀNH CÔNG!")

if __name__ == '__main__':
    run_seed()