// src/routes/restaurant/index.js
import express from 'express';
import tableAdminRoutes from './tableAdmin.routes.js'; 
import menuRoutes from './menu.routes.js'; 
import menuItemPhotoRoutes from './menuItemPhoto.routes.js';
import orderRoutes from './order.routes.js';

const router = express.Router();

router.use('/tables', tableAdminRoutes);
router.use('/menu', menuRoutes);
router.use('/menu', menuItemPhotoRoutes);
router.use('/orders', orderRoutes);

export default router;