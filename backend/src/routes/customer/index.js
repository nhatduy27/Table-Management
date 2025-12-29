// src/routes/customer/index.js
import express from 'express';
import verifyQRTokenMiddleware from '../../middlewares/verifyQRToken.middleware.js';
import guestMenuRoutes from "./guestMenu.routes.js";

const router = express.Router();

router.use('/menu', verifyQRTokenMiddleware, guestMenuRoutes);

export default router;