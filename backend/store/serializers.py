from rest_framework import serializers
from .models import Order, OrderItem, Product, Artist

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    # Trả về chi tiết Artist thay vì chỉ ID (tùy chọn)
    artist_info = ArtistSerializer(source='artist', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        
class OrderItemSerializer(serializers.ModelSerializer):
    # Lấy tên và ảnh từ Product sang để Frontend hiển thị cho đẹp
    name = serializers.CharField(source='product.name', read_only=True)
    image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = OrderItem
        # LƯU Ý: Chữ 'quantity' ở dưới này phải khớp với tên cột trong models.py của bạn (nếu bạn dùng 'qty' thì đổi lại nhé)
        fields = ['id', 'product', 'name', 'quantity', 'price', 'image']

class OrderSerializer(serializers.ModelSerializer):
    # Dùng SerializerMethodField: Cách này là bách phát bách trúng!
    orderItems = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = '__all__'

    # Hàm này sẽ tự động chạy để đi tìm tất cả sản phẩm thuộc về đơn hàng này
    def get_orderItems(self, obj):
        # Truy vấn thẳng vào bảng OrderItem, tìm những món có mã đơn = đơn hiện tại
        items = OrderItem.objects.filter(order=obj)
        # Đóng gói và trả về cho React
        return OrderItemSerializer(items, many=True).data