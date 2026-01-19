// routes/orderItem.routes.js
import express from 'express';
import {
  getOrderItemsByOrderId,
  createOrderItems
} from '../../controllers/customer/orderItem.controller.js';
import {
  validateCreateOrderItem,
} from '../../middlewares/orderItem.middleware.js';

const router = express.Router();

// GET /api/order-items/order/:orderId
router.get(
  '/order/:orderId',
  getOrderItemsByOrderId
);

// POST /api/order-items
router.post(
  '/',
  validateCreateOrderItem,
  createOrderItems
);

export default router;