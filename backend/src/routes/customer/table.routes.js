import express from 'express';
import { getTableActiveOrder } from '../../controllers/customer/table.controller.js';

const router = express.Router();

// GET /api/customer/tables/:tableId/active-order
router.get('/:tableId/active-order', getTableActiveOrder);

export default router;
