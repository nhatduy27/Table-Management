-- Thêm payment_method và transaction_id vào bảng orders
ALTER TABLE orders 
ADD COLUMN payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'momo', 'vnpay', 'zalopay', 'stripe')),
ADD COLUMN transaction_id VARCHAR(255);

COMMENT ON COLUMN orders.payment_method IS 'Phương thức thanh toán';
COMMENT ON COLUMN orders.transaction_id IS 'Mã giao dịch từ payment gateway';
