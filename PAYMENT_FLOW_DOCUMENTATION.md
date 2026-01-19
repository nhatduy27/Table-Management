# 💳 Payment Flow Documentation

## Tổng quan
Hệ thống hỗ trợ nhiều phương thức thanh toán cho khách hàng sau khi dùng bữa.

## Phương thức thanh toán hỗ trợ
- **Tiền mặt (Cash)**: Thanh toán trực tiếp cho nhân viên
- **MoMo**: Ví điện tử MoMo
- **VNPay**: Cổng thanh toán VNPay
- **ZaloPay**: Ví điện tử ZaloPay
- **Stripe**: Thẻ quốc tế (Credit/Debit Card)

## Luồng thanh toán (Payment Flow)

### 1. Customer Request Bill
**Trigger**: Khách hàng bấm nút "Yêu cầu thanh toán" trong OrderDetailModal

**Điều kiện**: 
- Tất cả món phải ở trạng thái `served` (đã lên bàn)
- Order status không được là `payment`, `completed`, hoặc `cancelled`

**Actions**:
```javascript
// Frontend: MenuPage.jsx
handleRequestPayment(orderId, paymentMethod)
  → CustomerService.requestPayment(orderId, paymentMethod)
  
// Backend: payment.controller.js → requestPayment()
1. Validate order tồn tại
2. Kiểm tra status hợp lệ
3. Kiểm tra allItemsServed = true
4. Update order.status = 'payment'
5. Update order.payment_method = selectedMethod
6. Emit socket 'order_status_updated' → Waiter Dashboard
```

**Response**:
- Order object với status = `payment`
- Waiter dashboard nhận notification có đơn cần thanh toán

### 2. Payment Processing

#### 2A. Tiền mặt (Cash)
```
Customer bấm "Thanh toán" với method=cash
→ Order chuyển sang status='payment'
→ Waiter nhận thông báo
→ Waiter đến bàn thu tiền
→ Waiter bấm "Xác nhận thanh toán" trong WaiterDashboard
→ Order chuyển sang status='completed'
```

**Backend**: Waiter gọi `PUT /api/admin/orders/:id/status` với status=`completed`

#### 2B. Online Payment (MoMo, VNPay, ZaloPay, Stripe)
```
Customer bấm "Thanh toán" với method=momo/vnpay/etc
→ Order chuyển sang status='payment'
→ Frontend redirect đến Payment Gateway URL (Mock)
→ Gateway xử lý thanh toán
→ Gateway callback về backend với kết quả
→ Backend update order.status='completed', order.transaction_id
→ Socket notify Customer & Waiter
```

**Mock Payment Gateway Flow**:
```javascript
// BillModal.jsx - handleOnlinePayment()
1. Alert thông báo đang chuyển đến gateway
2. Sau 2 giây (mock processing):
3. Gọi API completePayment với transaction_id
4. Backend cập nhật order.status = 'completed'
5. Emit socket notification
6. Alert "Thanh toán thành công"
```

**Production Gateway Flow** (Cần implement):
```
1. Backend tạo payment request với gateway
2. Gateway trả về payment URL
3. Frontend redirect customer đến URL
4. Customer nhập thông tin thanh toán trên gateway
5. Gateway xử lý và callback về backend
6. Backend verify signature/hash từ gateway
7. Backend update order status
8. Frontend redirect customer về success page
```

### 3. Payment Completion

**API Endpoint**: `POST /api/customer/orders/:orderId/complete-payment`

**Request Body**:
```json
{
  "transaction_id": "VNPAY_1234567890",
  "payment_method": "vnpay"
}
```

**Backend Actions**:
```javascript
payment.controller.js → completePayment()
1. Validate order.status === 'payment'
2. Update order.status = 'completed'
3. Update order.transaction_id
4. Update order.completed_at = NOW()
5. Emit 'order_status_updated' socket event
6. Return success response
```

**Frontend Actions**:
- MenuPage nhận socket update
- Hiển thị SweetAlert "Cảm ơn quý khách"
- Đề xuất đánh giá món ăn
- Reset activeOrder (bàn trở về trạng thái trống)

## Database Schema

### Orders Table - New Columns
```sql
ALTER TABLE orders 
ADD COLUMN payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'momo', 'vnpay', 'zalopay', 'stripe')),
ADD COLUMN transaction_id VARCHAR(255);
```

### Order Status Flow
```
pending → confirmed → preparing → ready → served → payment → completed
                                                   ↓
                                              cancelled
```

## Socket Events

### 1. order_status_updated (Global)
**Emitted**: Khi order status thay đổi (bao gồm payment → completed)
**Listeners**: 
- WaiterDashboard (frontend-admin)
- Kitchen Dashboard (frontend-admin)

**Payload**:
```javascript
{
  id: "uuid",
  status: "payment" | "completed",
  payment_method: "cash" | "momo" | "vnpay" | "zalopay" | "stripe",
  transaction_id: "VNPAY_xxx",
  items: [...],
  table: {...},
  total_amount: 150000,
  completed_at: "2026-01-14T10:30:00Z"
}
```

### 2. order_update_table_{tableId} (Table-specific)
**Emitted**: Khi order của bàn cụ thể thay đổi
**Listeners**: 
- MenuPage của customer đang ngồi bàn đó

**Payload**: Same as above

## Frontend Components

### 1. BillModal.jsx
**Props**:
- `isOpen`: boolean
- `onClose`: function
- `order`: Order object
- `onRequestPayment`: (orderId, paymentMethod) => Promise

**Features**:
- Hiển thị chi tiết hóa đơn (items, subtotal, tax, service charge)
- Kiểm tra allItemsServed
- Chọn payment method (5 options)
- Button "Thanh toán" chỉ enable khi allItemsServed
- Mock payment gateway integration

### 2. OrderDetailModal.jsx
**New Features**:
- Nút "Yêu cầu thanh toán" (purple gradient button)
- Chỉ hiện khi order status ≠ payment/completed/cancelled
- Gọi `onRequestBill()` để mở BillModal

### 3. MenuPage.jsx
**New State**:
- `showBillModal`: boolean

**New Handlers**:
- `handleRequestPayment(orderId, paymentMethod)`
  - Gọi CustomerService.requestPayment
  - Update activeOrder
  - Hiển thị thông báo

## API Endpoints

### Customer APIs

#### POST /api/customer/orders/:orderId/request-payment
**Request**:
```json
{
  "payment_method": "cash" | "momo" | "vnpay" | "zalopay" | "stripe"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Đã yêu cầu thanh toán bằng momo",
  "data": { ...order }
}
```

**Errors**:
- 404: Order not found
- 400: Order already in payment/completed
- 400: Not all items served yet

#### POST /api/customer/orders/:orderId/complete-payment
**Request**:
```json
{
  "transaction_id": "MOMO_1234567890",
  "payment_method": "momo"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Thanh toán thành công",
  "data": { ...order }
}
```

### Admin APIs (Existing)

#### PUT /api/admin/orders/:orderId/status
**Request**:
```json
{
  "status": "completed"
}
```

**Usage**: Waiter xác nhận thanh toán tiền mặt

## Payment Gateway Callbacks (Mock)

### GET /api/customer/payment/vnpay-callback
**Query Params**:
- `orderId`: UUID
- `status`: "success" | "failed"
- `transactionId`: string

**Action**: 
- Update order to completed
- Emit socket
- Redirect to success/failed page

### POST /api/customer/payment/momo-callback
**Request Body**:
```json
{
  "orderId": "uuid",
  "resultCode": "0",
  "transId": "MOMO_xxx"
}
```

## Testing Scenarios

### Test Case 1: Cash Payment
1. Customer đặt món
2. Waiter xác nhận → confirmed
3. Kitchen nấu → preparing → ready
4. Waiter bưng món → served
5. Customer bấm "Yêu cầu thanh toán"
6. Chọn "Tiền mặt"
7. Xác nhận → Order chuyển sang payment
8. Waiter nhận thông báo
9. Waiter bấm "Xác nhận thanh toán"
10. Order chuyển sang completed ✅

### Test Case 2: MoMo Payment
1. Steps 1-6 same as above
7. Chọn "MoMo"
8. Alert "Đang chuyển đến cổng thanh toán..."
9. Sau 2s mock payment complete
10. Order chuyển sang completed ✅
11. Customer nhận notification "Thanh toán thành công"

### Test Case 3: Payment Before Served
1. Customer đặt món
2. Món đang preparing/ready (chưa served)
3. Customer bấm "Yêu cầu thanh toán"
4. Alert "Vui lòng đợi tất cả món được phục vụ" ❌
5. Button bị disable

### Test Case 4: Duplicate Payment Request
1. Customer đã request payment
2. Order status = payment
3. Thử request lại
4. Backend trả về 400 "Đơn hàng đã được yêu cầu thanh toán" ❌

## Production Implementation (TODO)

### VNPay Integration
1. Register merchant account
2. Get API credentials (vnp_TmnCode, vnp_HashSecret)
3. Implement vnpay payment URL generation
4. Implement IPN callback handler
5. Verify vnp_SecureHash

### MoMo Integration
1. Register MoMo Business account
2. Get partnerCode, accessKey, secretKey
3. Implement MoMo payment request
4. Implement IPN callback
5. Verify signature

### ZaloPay Integration
Similar to MoMo

### Stripe Integration
1. Get publishable key & secret key
2. Use Stripe.js on frontend
3. Create PaymentIntent on backend
4. Handle webhook events
5. Confirm payment

## Security Considerations

### 1. Payment Verification
- ALWAYS verify callback signature/hash from gateway
- Check amount matches order total
- Prevent replay attacks (use nonce/timestamp)

### 2. Order Status Validation
- Only allow payment request if allItemsServed
- Prevent status manipulation (validate transitions)
- Lock order during payment processing

### 3. Transaction ID
- Store unique transaction_id from gateway
- Prevent duplicate processing
- Use for reconciliation

### 4. Error Handling
- Timeout handling (15-30 mins)
- Failed payment retry
- Refund process for cancelled orders

## Files Modified/Created

### Frontend (frontend-customer)
- ✅ `src/components/menu/BillModal.jsx` (NEW)
- ✅ `src/components/menu/OrderDetailModal.jsx` (MODIFIED)
- ✅ `src/components/menu/MenuPage.jsx` (MODIFIED)
- ✅ `src/services/customerService.js` (MODIFIED)

### Backend
- ✅ `src/controllers/customer/payment.controller.js` (NEW)
- ✅ `src/routes/customer/payment.routes.js` (NEW)
- ✅ `src/routes/customer/index.js` (MODIFIED)
- ✅ `src/models/order.js` (MODIFIED)
- ✅ `migrations/add_payment_columns.sql` (NEW)

### Admin Frontend (frontend-admin)
- ✅ `src/components/waiter/WaiterDashboard.jsx` (Already has payment handling)

## Notes
- Mock payment sử dụng setTimeout 2s để simulate gateway processing
- Production cần replace bằng real gateway URLs
- Cần thêm payment history tracking
- Cần implement refund logic
- Cần thêm receipt printing
