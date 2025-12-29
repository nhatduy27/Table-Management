// src/routes/index.js
import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js'; // Middleware check login admin

import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant/index.js';
import customerRoutes from './customer/index.js';

const router = express.Router();

// 1. Auth (Login/Register) - Công khai
router.use('/auth', authRoutes);

// 2. Khu vực Nhà hàng (Cần Login Staff/Admin)
router.use('/admin', verifyToken, restaurantRoutes);

// 3. Khu vực Khách hàng (Check QR hoặc công khai)
router.use('/', customerRoutes);

export default router;