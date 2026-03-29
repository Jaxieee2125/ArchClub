from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Product, Artist
from .serializers import ProductSerializer, ArtistSerializer
from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.response import Response

# 1. Custom Permission cho Admin
class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # Nếu chỉ là xem dữ liệu (GET, HEAD, OPTIONS) -> Cho phép
        if request.method in permissions.SAFE_METHODS:
            return True
        # Nếu là thao tác ghi -> Phải đăng nhập và là Admin (Staff)
        return bool(request.user and request.user.is_staff)

# 2. ViewSet cho Artist
class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = [IsAdminUserOrReadOnly]

# 3. ViewSet cho Product
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # 1. Lấy tham số từ URL
        search_query = self.request.query_params.get('q', None)
        formats = self.request.query_params.get('product_format', None)
        artists = self.request.query_params.get('artist', None)

        # 2. Xử lý Search (Tìm theo tên SP hoặc tên Nghệ sĩ)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) | 
                Q(artist__name__icontains=search_query)
            )

        # 3. Xử lý Filter Định dạng (VD: format=CD,VINYL)
        if formats:
            format_list = formats.split(',')
            queryset = queryset.filter(format__in=format_list)

        # 4. Xử lý Filter Nghệ sĩ (VD: artist=Thắng,Ngọt)
        if artists:
            artist_list = artists.split(',')
            queryset = queryset.filter(artist__name__in=artist_list)

        return queryset