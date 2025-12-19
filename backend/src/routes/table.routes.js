import express from 'express';
import { 
  getAllTable, 
  createTable, 
  getTableById,
  updateTable,
  updateTableStatus
} from '../controllers/table.controller.js';
import {
  generateQRCode,
  regenerateQRCode,
  bulkRegenerateQRCodes,
  downloadQRCode,
  downloadAllQRCodes,
  verifyQRToken,
  getQRPreview
} from '../controllers/qr.controller.js';

const router = express.Router();

// ============= Table CRUD Routes =============
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

// ============= QR Code Routes =============
// POST /api/admin/tables/:id/qr/generate - Generate/Regenerate QR code
router.post('/tables/:id/qr/generate', generateQRCode);

// POST /api/admin/tables/:id/qr/regenerate - Regenerate QR code (invalidate old)
router.post('/tables/:id/qr/regenerate', regenerateQRCode);

// POST /api/admin/tables/qr/regenerate-all - Bulk regenerate all QR codes
router.post('/tables/qr/regenerate-all', bulkRegenerateQRCodes);

// GET /api/admin/tables/:id/qr/download - Download QR code (PNG or PDF)
router.get('/tables/:id/qr/download', downloadQRCode);

// GET /api/admin/tables/qr/download-all - Download all QR codes (ZIP or PDF)
router.get('/tables/qr/download-all', downloadAllQRCodes);

// GET /api/admin/tables/:id/qr/preview - Get QR code preview
router.get('/tables/:id/qr/preview', getQRPreview);

// ============= Public Routes (Customer) =============
// GET /api/menu - Verify QR token and load menu
router.get('/menu', verifyQRToken);


export default router;