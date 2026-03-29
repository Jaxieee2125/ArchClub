from django.db import models
from django.contrib.auth.models import User

class Artist(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True) # Dùng cho URL thân thiện, vd: /artist/blackpink
    image = models.ImageField(upload_to='artists/', null=True, blank=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=200)
    
    def __str__(self):
        return self.name

class Product(models.Model):
    
    FORMAT_CHOICES = [
        ('CD', 'CD'),
        ('VINYL', 'Vinyl'),
        ('CASSETTE', 'Cassette'),
        ('MERCH', 'Merch'),
        ('GEAR', 'Gear'),
        ('BY AC', 'By ArchClub'),
        ('SALE', 'Sale'),
        ('RESTOCK', 'Restock'),
        ('OTHER', 'Other')
    ]
    
    name = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Lưu giá tiền
    stock = models.IntegerField(default=0) # Số lượng tồn kho
    image = models.ImageField(upload_to='products/')
    
    format = models.CharField(max_length=20, choices=FORMAT_CHOICES, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0) # Thêm default=0
    is_percentage = models.BooleanField(default=False) # True = giảm %, False = giảm thẳng tiền
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_to = models.DateTimeField(null=True, blank=True) # Thêm null=True, blank=True
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.code
    
class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Chờ xử lý'),
        ('Paid', 'Đã thanh toán'),
        ('Shipped', 'Đang giao hàng'),
        ('Delivered', 'Đã giao'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    shipping_address = models.TextField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # --- THÊM 2 TRƯỜNG NÀY ---
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_paid = models.BooleanField(default=False) # Đánh dấu đã thanh toán chưa
    paid_at = models.DateTimeField(auto_now_add=False, null=True, blank=True)
    # -------------------------
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Giá tại THỜI ĐIỂM MUA (đề phòng sau này đổi giá SP)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"