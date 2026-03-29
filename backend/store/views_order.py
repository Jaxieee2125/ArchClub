from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Coupon, Product, Order, OrderItem
from .serializers import OrderSerializer
from django.utils import timezone
import datetime
from .vnpay import vnpay

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for: return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')

@api_view(['POST'])
@permission_classes([IsAuthenticated]) # Bắt buộc đăng nhập mới được mua
def add_order_items(request):
    user = request.user
    data = request.data
    
    

    orderItems = data.get('orderItems')
    
    # 🚨 1. CHẶN GIỎ HÀNG RỖNG
    if not orderItems or len(orderItems) == 0:
        return Response({'error': 'Giỏ hàng trống'}, status=status.HTTP_400_BAD_REQUEST)

    # 🚨 2. CHẶN ĐỊA CHỈ RỖNG, NULL, HOẶC CHỨA MÃ ĐỘC (XSS)
    shipping_address = data.get('shippingAddress', '')
    if not shipping_address or str(shipping_address).strip() == '' or shipping_address == 'None' or '<script>' in str(shipping_address):
        return Response({'error': 'Địa chỉ giao hàng không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    # 🚨 3. CHẶN PHƯƠNG THỨC THANH TOÁN BẬY BẠ
    payment_method = data.get('paymentMethod')
    if payment_method not in ['COD', 'VNPAY']:
        return Response({'error': 'Phương thức thanh toán không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    if orderItems and len(orderItems) == 0:
        return Response({'detail': 'Giỏ hàng của bạn đang trống!'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        try:
            # transaction.atomic() giúp an toàn dữ liệu: Nếu có lỗi ở bất kỳ bước nào, nó sẽ rollback (hủy) toàn bộ, không bị tình trạng trừ kho mà chưa tạo đơn.
            with transaction.atomic():
                
                # 1. Tạo Đơn hàng (Order)
                payment_method = data.get('paymentMethod', 'COD')
                order = Order.objects.create(
                    user=user,
                    shipping_address=data.get('shippingAddress'),
                    total_price=data.get('totalPrice'),
                    
                    
                    is_paid=False,
                    status='Pending'
                )
                
                for i in orderItems:
                    try:
                        qty = int(i['qty'])
                        if qty <= 0:
                            raise ValueError("Số lượng phải lớn hơn 0")
                    except (ValueError, TypeError):
                        # Cố tình hack số lượng âm hoặc điền chữ -> Xóa đơn vừa tạo và báo lỗi
                        order.delete()
                        return Response({'error': 'Số lượng sản phẩm không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

                    product = Product.objects.get(id=i['product_id'])
                    # Kiểm tra tồn kho
                    if product.stock < qty:
                        order.delete()
                        return Response({'error': f'Sản phẩm không đủ số lượng'}, status=status.HTTP_400_BAD_REQUEST)

                # 2. Tạo Chi tiết đơn (OrderItem) và Trừ tồn kho (Stock)
                for i in orderItems:
                    # Dùng select_for_update() để khóa row này lại, tránh trường hợp 2 người cùng mua 1 món cùng lúc
                    product = Product.objects.select_for_update().get(id=i['product_id'])
                    
                    # Kiểm tra xem kho còn đủ hàng không
                    if product.stock < i['qty']:
                        raise ValueError(f"Sản phẩm '{product.name}' không đủ số lượng trong kho!")

                    # Tạo OrderItem
                    item = OrderItem.objects.create(
                        product=product,
                        order=order,
                        quantity=i['qty'], # Đổi thành quantity cho khớp với model mặc định
                        price=i['price']
                    )

                    # Trừ tồn kho
                    product.stock -= item.quantity
                    product.save()

                # 3. KÍCH HOẠT VNPAY (Nếu khách chọn VNPAY)
                if payment_method == 'VNPAY':
                    vnp = vnpay()
                    vnp.requestData['vnp_Version'] = '2.1.0'
                    vnp.requestData['vnp_Command'] = 'pay'
                    vnp.requestData['vnp_TmnCode'] = 'OIK4KL1U' # Mã Terminal Demo
                    vnp.requestData['vnp_Amount'] = str(int(float(order.total_price) * 100)) # VNPay yêu cầu nhân 100
                    vnp.requestData['vnp_CurrCode'] = 'VND'
                    vnp.requestData['vnp_TxnRef'] = str(order.id) # Mã đơn hàng
                    vnp.requestData['vnp_OrderInfo'] = f'Thanh toan don hang {order.id}'
                    vnp.requestData['vnp_OrderType'] = 'billpayment'
                    vnp.requestData['vnp_Locale'] = 'vn'
                    vnp.requestData['vnp_IpAddr'] = get_client_ip(request)
                    vnp.requestData['vnp_CreateDate'] = timezone.now().strftime('%Y%m%d%H%M%S')
                    vnp.requestData['vnp_ReturnUrl'] = 'http://localhost:5173/vnpay-return' # Link dẫn về React sau khi thanh toán
                    
                    secret_key = '7HZOKVDNTX4KSGBVDQDJRH8QHMXN8NY8' # Chuỗi bí mật Demo
                    vnpay_url = vnp.get_payment_url('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', secret_key)
                    
                    # Trả về kèm theo URL của VNPay
                    return Response({
                        'id': order.id, 
                        'vnpay_url': vnpay_url
                    }, status=status.HTTP_201_CREATED)

                # 4. THANH TOÁN COD (Hoặc chuyển khoản tay)
                # Chỉ cần trả về ID đơn hàng
                return Response({'id': order.id}, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # IN THẲNG LỖI RA TERMINAL CHO DỄ BẮT BỆNH
            print("CHI TIẾT LỖI CRASH BÊN DJANGO NÈ MÁ:", repr(e)) 
            
            # Trả nguyên văn cái lỗi về màn hình Frontend luôn
            return Response({'detail': f'Lỗi hệ thống: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API Lấy danh sách đơn hàng của User đang đăng nhập
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    user = request.user
    orders = user.order_set.all().order_by('-created_at') # Lấy đơn mới nhất lên đầu
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def verify_coupon(request):
    code = request.data.get('code')
    cart_total = request.data.get('cart_total', 0)

    try:
        # Tìm mã code (không phân biệt chữ hoa chữ thường)
        coupon = Coupon.objects.get(code__iexact=code, active=True)

        # Rule 1: Kiểm tra hạn sử dụng
        if coupon.valid_to < timezone.now():
            return Response({'error': 'Mã giảm giá đã hết hạn sử dụng!'}, status=400)

        # Rule 2: Kiểm tra giá trị đơn hàng tối thiểu
        if float(cart_total) < float(coupon.min_order_value):
            return Response({'error': f'Đơn hàng tối thiểu phải từ {coupon.min_order_value:,.0f}đ!'}, status=400)

        # Tính toán tiền giảm
        if coupon.is_percentage:
            discount = float(cart_total) * (float(coupon.discount_value) / 100)
        else:
            discount = float(coupon.discount_value)

        return Response({
            'success': True,
            'code': coupon.code,
            'discount_amount': discount,
            'message': 'Áp dụng mã thành công!'
        })

    except Coupon.DoesNotExist:
        return Response({'error': 'Mã giảm giá không hợp lệ hoặc không tồn tại!'}, status=400)
    
# 1. API Cập nhật trạng thái sau khi khách thanh toán thành công
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_to_paid(request, pk):
    try:
        order = Order.objects.get(id=pk, user=request.user)
        
        if order.is_paid:
            return Response({'detail': 'Đơn hàng này đã được thanh toán rồi.'}, status=status.HTTP_400_BAD_REQUEST)

        # Cập nhật trạng thái
        order.is_paid = True
        order.paid_at = datetime.datetime.now()
        order.status = 'Paid'
        order.save()

        return Response('Đơn hàng đã được thanh toán thành công!')
    except Order.DoesNotExist:
        return Response({'detail': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)

# 2. (Tùy chọn) API Tạo Link VNPay mô phỏng
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vnpay_payment(request, pk):
    try:
        order = Order.objects.get(id=pk, user=request.user)
        # Thực tế ở đây bạn sẽ dùng thư viện vnpay_python để tạo URL chứa checksum.
        # Ví dụ trả về URL giả lập:
        payment_url = f"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount={int(order.total_price)*100}&vnp_TxnRef={order.id}"
        
        return Response({'payment_url': payment_url})
    except Order.DoesNotExist:
        return Response({'detail': 'Không tìm thấy đơn hàng'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['GET'])
def vnpay_return_view(request):
    inputData = request.GET.dict()
    if inputData:
        vnp = vnpay()
        vnp.responseData = inputData
        secret_key = '7HZOKVDNTX4KSGBVDQDJRH8QHMXN8NY8' # Dùng đúng mã lúc tạo
        
        if vnp.validate_response(secret_key):
            if inputData['vnp_ResponseCode'] == '00':
                # Thanh toán thành công -> Đổi trạng thái đơn
                order = Order.objects.get(id=inputData['vnp_TxnRef'])
                order.is_paid = True
                order.status = 'Processing'
                order.save()
                return Response({'success': True, 'message': 'Giao dịch thành công'})
        return Response({'success': False, 'message': 'Giao dịch thất bại hoặc bị hủy'})
    return Response({'success': False})