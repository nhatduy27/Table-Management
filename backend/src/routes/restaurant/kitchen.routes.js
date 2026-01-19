// src/routes/restaurant/kitchen.routes.js
import express from "express";
import {
  getKitchenOrders,
  getKitchenStats,
  updateOrderItemStatus,
} from "../../controllers/restaurant/kitchen.controller.js";

import {
  updateOrderStatus,
} from "../../controllers/restaurant/order.controller.js";

const router = express.Router();

// GET /api/admin/kitchen/orders - Lấy danh sách đơn hàng cho kitchen
router.get("/orders", getKitchenOrders);

// GET /api/admin/kitchen/stats - Lấy thống kê
router.get("/stats", getKitchenStats);

// PATCH /api/admin/kitchen/orders/:orderId/status - Cập nhật trạng thái đơn hàng
router.patch("/orders/:orderId/status", updateOrderStatus);

// PUT /api/admin/kitchen/items/:itemId/status
router.put('/items/:itemId/status', updateOrderItemStatus)

export default router;
