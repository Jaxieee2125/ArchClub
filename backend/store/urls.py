from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, ArtistViewSet
from .views_auth import MyTokenObtainPairView, register_user
from .views_order import add_order_items, verify_coupon, create_vnpay_payment, get_my_orders, update_order_to_paid, vnpay_return_view

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'artists', ArtistViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # API cho User & Auth
    path('users/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/register/', register_user, name='register'),
    
    

    # API cho Order (Đơn hàng)
    path('orders/add/', add_order_items, name='orders-add'),
    path('orders/myorders/', get_my_orders, name='myorders'),
    path('orders/<int:pk>/pay/', update_order_to_paid, name='pay-order'),
    path('orders/<int:pk>/create-vnpay/', create_vnpay_payment, name='create-vnpay'),
    path('orders/vnpay-return/', vnpay_return_view, name='vnpay-return'),
    path('orders/apply-coupon/', verify_coupon, name='apply-coupon'),
]