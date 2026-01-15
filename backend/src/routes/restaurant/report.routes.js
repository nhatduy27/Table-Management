// src/routes/restaurant/report.routes.js
import express from 'express';
import * as reportController from '../../controllers/restaurant/report.controller.js';

// Middleware kiểm tra quyền Admin/Manager (nếu có)
// import { verifyAdmin } from '../../middleware/authMiddleware.js'; 

const router = express.Router();

// GET /api/admin/reports/stats -> Thống kê nhanh
router.get('/stats', reportController.getDashboardStats);

// GET /api/admin/reports/revenue -> Biểu đồ doanh thu
router.get('/revenue', reportController.getRevenueChart);

// GET /api/admin/reports/top-items -> Top món bán chạy
router.get('/top-items', reportController.getTopSellingItems);

router.get('/peak-hours', reportController.getPeakHours);

export default router;