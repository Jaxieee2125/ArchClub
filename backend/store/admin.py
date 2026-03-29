from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Artist, Category, Coupon, Product, Order, OrderItem

# 1. Đăng ký cơ bản (Chỉ hiện tên object)
admin.site.register(Category)

# 2. Đăng ký nâng cao (Tùy chỉnh giao diện hiển thị)
@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug') # Các cột hiển thị ngoài danh sách
    prepopulated_fields = {'slug': ('name',)} # Tự động điền slug dựa theo tên (vd: BlackPink -> blackpink)
    search_fields = ('name',) # Thêm thanh tìm kiếm theo tên

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'artist', 'category', 'price', 'stock', 'created_at')
    list_filter = ('artist', 'category') # Thêm bộ lọc bên phải màn hình
    search_fields = ('name',)
    list_editable = ('price', 'stock') # Cho phép sửa giá và tồn kho trực tiếp ngoài danh sách mà không cần bấm vào chi tiết

# 3. Hiển thị OrderItem (Chi tiết đơn) ngay bên trong giao diện của Order (Đơn hàng)
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0 
    # LƯU Ý: Chỗ này tui để 'quantity', nếu trong models.py của bạn dùng 'qty' thì đổi lại nha!
    readonly_fields = ['product', 'quantity', 'price'] 
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_price', 'is_paid', 'status', 'created_at']
    list_filter = ['status', 'is_paid', 'created_at']
    search_fields = ['id', 'user__username', 'shipping_address']
    inlines = [OrderItemInline]
    readonly_fields = ['user', 'shipping_address', 'total_price', 'discount_amount']
    
@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    # list_display: Các cột sẽ hiển thị ở màn hình danh sách mã giảm giá
    list_display = ['code', 'discount_value', 'is_percentage', 'min_order_value', 'valid_to', 'active']
    
    # list_filter: Bộ lọc bên tay phải
    list_filter = ['active', 'is_percentage', 'valid_to']
    
    # search_fields: Thanh tìm kiếm mã
    search_fields = ['code']

