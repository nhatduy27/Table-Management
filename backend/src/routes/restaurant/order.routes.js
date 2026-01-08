import express from 'express';
import { updateOrderStatus, getAllOrders } from '../../controllers/restaurant/order.controller.js'; 

const router = express.Router();

router.get('/', getAllOrders);

// Định nghĩa API: PUT /api/admin/orders/:orderId/status
router.put('/:orderId/status', updateOrderStatus);

export default router;