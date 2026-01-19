import express from 'express';
import { 
    getAllOrders, 
    updateOrderStatus, 
    rejectOrderItem,
    confirmBill,  // [MỚI] Import thêm
    markAsPaid    // [MỚI] Import thêm
} from '../../controllers/restaurant/order.controller.js'; 

const router = express.Router();

// 1. Lấy danh sách đơn hàng
// URL: GET /api/admin/orders
router.get('/', getAllOrders);

// 2. Cập nhật trạng thái đơn (Duyệt, Bưng, Bếp)
// URL: PUT /api/admin/orders/:orderId/status
router.put('/:orderId/status', updateOrderStatus);

// 3. Hủy món lẻ
// URL: PUT /api/admin/orders/items/:itemId/reject
router.put('/items/:itemId/reject', rejectOrderItem); 

// ==========================================
// 🔥 CÁC API MỚI CHO THANH TOÁN (WAITER)
// ==========================================

// 4. Waiter chốt bill (Nhập giảm giá, thuế -> Chuyển status sang payment_pending)
// URL: PUT /api/admin/orders/:orderId/confirm-bill
router.put('/:orderId/confirm-bill', confirmBill);

// 5. Waiter xác nhận đã thu tiền mặt (Hoàn tất đơn)
// URL: PUT /api/admin/orders/:orderId/pay
router.put('/:orderId/pay', markAsPaid);

export default router;