import express from 'express';
import { 
  getAllTable, 
  createTable, 
  getTableById,
  updateTable,
  updateTableStatus
} from '../controllers/table.controller.js';

const router = express.Router();

// GET /api/tables
router.get('/tables', getAllTable);

// GET /api/tables/:id
router.get('/tables/:id', getTableById);

// POST /api/tables
router.post('/tables', createTable);

//PUT	/api/admin/tables/:id
router.put('/tables/:id', updateTable);

//PATCH	/api/admin/tables/:id/status
router.patch('/tables/:id/status', updateTableStatus);


export default router;