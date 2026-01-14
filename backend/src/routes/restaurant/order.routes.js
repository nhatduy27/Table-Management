import express from 'express';
import { updateOrderStatus, getAllOrders, rejectOrderItem } from '../../controllers/restaurant/order.controller.js'; 

const router = express.Router();

router.get('/', getAllOrders);

// Định nghĩa API: PUT /api/admin/orders/:orderId/status
router.put('/:orderId/status', updateOrderStatus);
router.put('/:orderId/status', updateOrderStatus);

// Định nghĩa API: PUT /api/admin/orders/items/:itemId/reject
router.put('/items/:itemId/reject', rejectOrderItem); 




export default router;