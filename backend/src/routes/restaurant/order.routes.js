import express from 'express';
import { updateOrderStatus, getAllOrders, updateOrderItemStatus } from '../../controllers/restaurant/order.controller.js'; 

const router = express.Router();

router.get('/', getAllOrders);

// Định nghĩa API: PUT /api/admin/orders/:orderId/status
router.put('/:orderId/status', updateOrderStatus);

// Thêm dòng này
router.put('/items/:itemId/status', updateOrderItemStatus);

export default router;