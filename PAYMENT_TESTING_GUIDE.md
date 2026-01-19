# 🧪 Testing Payment Feature

## Bước 1: Chạy Migration
```sql
-- Kết nối PostgreSQL
psql -U postgres -d table_management

-- Chạy migration
\i backend/migrations/add_payment_columns.sql
```

## Bước 2: Khởi động servers
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Admin Frontend
cd frontend-admin
npm run dev

# Terminal 3: Customer Frontend
cd frontend-customer
npm run dev
```

## Bước 3: Test Flow Thanh Toán

### Scenario 1: Thanh toán tiền mặt ✅

1. **Customer đặt món**
   - Scan QR code hoặc vào `http://localhost:5173/menu?table=<table_id>&token=<token>`
   - Chọn món → Thêm vào giỏ
   - Bấm "ĐẶT MÓN"
   - ✅ Check: Món xuất hiện trong Waiter Dashboard với badge "MỚI"

2. **Waiter duyệt đơn**
   - Vào `http://localhost:5174/waiter`
   - Bấm "Duyệt X món mới"
   - ✅ Check: Món chuyển sang trạng thái "Đã xác nhận (Chờ bếp)"

3. **Kitchen nấu món**
   - Vào `http://localhost:5174/kitchen`
   - Bấm "NHẬN NẤU"
   - Đánh dấu xong từng món (✓)
   - Bấm "HOÀN TẤT ĐƠN"
   - ✅ Check: Order chuyển sang "ready"

4. **Waiter bưng món**
   - Trong Waiter Dashboard
   - Bấm "Bưng món" cho từng món có badge "Đã xong"
   - ✅ Check: Món chuyển sang "Đã lên"

5. **Customer request bill**
   - Click nút tròn màu xanh dưới cùng (FloatingOrderButton)
   - Trong modal chi tiết đơn, bấm "Yêu cầu thanh toán"
   - ✅ Check: BillModal xuất hiện
   - ✅ Check: Tất cả món hiển thị status "✓ Đã lên"

6. **Customer chọn thanh toán tiền mặt**
   - Chọn payment method "💵 Tiền mặt"
   - Bấm "Thanh toán XXXX VND"
   - Xác nhận dialog
   - ✅ Check: Alert "Đã gửi yêu cầu thanh toán tiền mặt"
   - ✅ Check: Modal đóng

7. **Waiter nhận thông báo**
   - Trong Waiter Dashboard
   - ✅ Check: Order xuất hiện với badge "THANH TOÁN"
   - Bấm "Xác nhận thanh toán"
   - ✅ Check: Order biến mất (chuyển sang completed)

8. **Customer nhận thông báo hoàn tất**
   - MenuPage hiển thị SweetAlert "Cảm ơn quý khách"
   - ✅ Check: activeOrder reset = null

---

### Scenario 2: Thanh toán MoMo/VNPay ✅

1. **Lặp lại bước 1-5 ở Scenario 1**

2. **Customer chọn thanh toán online**
   - Trong BillModal, chọn "🟣 MoMo" hoặc "🔵 VNPay"
   - Bấm "Thanh toán"
   - Xác nhận dialog
   - ✅ Check: Alert "Đang chuyển đến cổng thanh toán MoMo..."
   
3. **Mock payment processing**
   - Sau 2 giây tự động
   - ✅ Check: Alert "Thanh toán thành công"
   - ✅ Check: Modal đóng

4. **Verify backend**
   - Check database: `SELECT * FROM orders WHERE id='<order_id>';`
   - ✅ Check: status = 'completed'
   - ✅ Check: payment_method = 'momo' hoặc 'vnpay'
   - ✅ Check: transaction_id = 'MOMO_...' hoặc 'VNPAY_...'
   - ✅ Check: completed_at có giá trị

5. **Waiter nhận notification**
   - ✅ Check: Order biến khỏi danh sách Waiter Dashboard

---

### Scenario 3: Chưa served hết món ❌

1. **Customer đặt 2 món**
2. **Waiter duyệt**
3. **Kitchen nấu món 1, chưa làm món 2**
4. **Waiter bưng món 1 lên bàn (món 2 chưa lên)**

5. **Customer request bill**
   - Bấm FloatingOrderButton → "Yêu cầu thanh toán"
   - ✅ Check: BillModal hiển thị
   - ✅ Check: Món 1 có status "✓ Đã lên"
   - ✅ Check: Món 2 có status "Đang làm" hoặc "Chờ bưng"

6. **Try thanh toán**
   - ✅ Check: Thấy cảnh báo vàng "Chưa thể thanh toán"
   - ✅ Check: Button "Thanh toán" bị disable (màu xám)
   - Click button
   - ✅ Check: Không có gì xảy ra (button disabled)

7. **Sau khi món 2 lên**
   - Waiter bưng món 2
   - Customer refresh bill
   - ✅ Check: Button "Thanh toán" enable (màu purple gradient)
   - ✅ Check: Không còn cảnh báo vàng

---

### Scenario 4: Double payment request ❌

1. **Hoàn thành Scenario 1 đến bước 6** (Customer đã request payment)
2. **Order đang ở status = 'payment'**

3. **Customer thử request lại**
   - F5 refresh trang (hoặc close/reopen bill modal)
   - Bấm "Yêu cầu thanh toán" lần nữa
   - ✅ Check: Backend trả về error 400
   - ✅ Check: Alert "Đơn hàng đã được yêu cầu thanh toán"

---

## Debug Checklist

### Backend Logs
```bash
# Terminal backend, xem logs:
🔵 Nhận socket order_status_updated: {...}
✅ Cập nhật order trong state: <orderId>
```

### Frontend Console Logs
```javascript
// MenuPage.jsx
Socket Update: { id: 'xxx', status: 'payment', ... }

// BillModal.jsx
Payment error: [nếu có lỗi]
```

### Database Verification
```sql
-- Check order status
SELECT id, status, payment_method, transaction_id, completed_at 
FROM orders 
WHERE table_id = '<table_id>' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check items served
SELECT oi.id, oi.status, mi.name
FROM order_items oi
JOIN menu_items mi ON oi.menu_item_id = mi.id
WHERE oi.order_id = '<order_id>';
```

### Socket Events
Mở Chrome DevTools → Network → WS → Messages:
- ✅ Thấy event `order_status_updated`
- ✅ Thấy event `order_update_table_<tableId>`

---

## Common Issues

### Issue 1: Button "Thanh toán" disabled mãi
**Nguyên nhân**: Items chưa served hoặc socket không cập nhật

**Fix**:
```javascript
// BillModal.jsx - Check console log
console.log('All items served?', allItemsServed);
console.log('Items:', order.items.map(i => ({ name: i.menu_item?.name, status: i.status })));
```

### Issue 2: "Order not found" khi payment
**Nguyên nhân**: orderId không tồn tại

**Fix**:
```sql
-- Check order tồn tại
SELECT * FROM orders WHERE id = '<orderId>';
```

### Issue 3: Payment method không lưu
**Nguyên nhân**: Column chưa được migrate

**Fix**:
```sql
-- Verify column tồn tại
\d orders
-- Nếu không thấy payment_method, chạy lại migration
```

### Issue 4: Socket không update UI
**Nguyên nhân**: Socket connection bị disconnect

**Fix**:
```javascript
// MenuPage.jsx useEffect
console.log('Socket connected:', socketRef.current?.connected);

// Kiểm tra server logs
// Backend terminal phải thấy: "New client connected"
```

---

## Production Readiness Checklist

### Before deploying to production:

- [ ] Replace mock payment với real gateway integration
- [ ] Implement payment signature verification
- [ ] Add transaction logging table
- [ ] Setup webhook endpoints for IPN
- [ ] Add payment timeout handling (15-30 mins)
- [ ] Implement refund process
- [ ] Add receipt generation/printing
- [ ] Setup payment reconciliation report
- [ ] Add retry mechanism for failed payments
- [ ] Implement payment analytics dashboard
- [ ] Setup alerts for failed transactions
- [ ] Document payment gateway credentials rotation
- [ ] Add PCI DSS compliance measures (nếu lưu card info)
- [ ] Setup backup payment method
- [ ] Test with real money in sandbox environment

---

## Next Steps (Future Enhancements)

1. **Split Bill**: Chia hóa đơn cho nhiều người
2. **Tip**: Thêm tip cho nhân viên
3. **Discount/Voucher**: Áp dụng mã giảm giá
4. **Print Receipt**: In hóa đơn VAT
5. **Payment History**: Lịch sử thanh toán trong profile
6. **Review After Payment**: Đánh giá món ăn sau thanh toán
7. **Loyalty Points**: Tích điểm thưởng
8. **Invoice Email**: Gửi hóa đơn qua email
