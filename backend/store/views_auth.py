from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import status

# 1. Tùy chỉnh nội dung Token
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Lấy thêm thông tin User gửi về cho React
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['is_staff'] = self.user.is_staff # True nếu là Admin
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# 2. API Đăng ký tài khoản mới
@api_view(['POST'])
def register_user(request):
    data = request.data
    try:
        user = User.objects.create(
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            username=data['email'],      # Dùng email làm username luôn cho tiện
            email=data['email'],
            password=make_password(data['password']) # Bắt buộc phải mã hóa mật khẩu
        )
        return Response({'message': 'Đăng ký thành công!'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': 'Email này đã tồn tại hoặc dữ liệu không hợp lệ!'}, status=status.HTTP_400_BAD_REQUEST)