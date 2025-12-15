import express from 'express';
import { 
  getAllTable, 
  createTable, 
  getTableById
} from '../controllers/table.controller.js';

const router = express.Router();

// GET /api/tables
router.get('/tables', getAllTable);

// POST /api/tables
//router.post('/', createTable);

// GET /api/tables/:id
router.get('/tables/:id', getTableById);


export default router;