import express from 'express';

import { 
  getTableNameByID
} from '../../controllers/restaurant/table.controller.js';

import {
  verifyQRToken
} from '../../controllers/restaurant/qr.controller.js';
const router = express.Router();

// GET /api/tables/name/:id
router.get('/name/:id', getTableNameByID);


// GET /api/menu - Verify QR token and load menu
router.get('/', verifyQRToken);


export default router;