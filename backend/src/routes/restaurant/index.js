// src/routes/restaurant/index.js
<<<<<<< HEAD
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
=======
import express from "express";
import tableAdminRoutes from "./tableAdmin.routes.js";
import menuRoutes from "./menu.routes.js";
import menuItemPhotoRoutes from "./menuItemPhoto.routes.js";
import kitchenRoutes from "./kitchen.routes.js";

const router = express.Router();

router.use("/tables", tableAdminRoutes);
router.use("/menu", menuRoutes);
router.use("/menu", menuItemPhotoRoutes);
router.use("/kitchen", kitchenRoutes);
>>>>>>> ef3799b465446b0d1f0c3ea2ecae782c5682aaa8

export default router;
