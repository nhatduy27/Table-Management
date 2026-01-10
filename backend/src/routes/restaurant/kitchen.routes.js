// src/routes/restaurant/kitchen.routes.js
import express from "express";
import {
  getKitchenOrders,
  updateOrderStatus,
  getKitchenStats,
} from "../../controllers/restaurant/kitchen.controller.js";

const router = express.Router();

// GET /api/admin/kitchen/orders - Lấy danh sách đơn hàng cho kitchen
router.get("/orders", getKitchenOrders);

// GET /api/admin/kitchen/stats - Lấy thống kê
router.get("/stats", getKitchenStats);

// PATCH /api/admin/kitchen/orders/:id/status - Cập nhật trạng thái đơn hàng
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
