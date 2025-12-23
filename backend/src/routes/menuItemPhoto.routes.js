import express from 'express';
import menuItemPhotoController from '../controllers/menuItemPhoto.controller.js';
// SỬA DÒNG NÀY: Import theo kiểu có ngoặc {}
import { uploadMenuItemPhotos, handleUploadErrors } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// 1. POST Upload
router.post(
  '/items/:id/photos', 
  uploadMenuItemPhotos, // Middleware upload
  handleUploadErrors,   // Middleware bắt lỗi (Thêm cái này vào để bắt lỗi 5MB)
  menuItemPhotoController.uploadPhotos
);

// ... Các route DELETE, PATCH giữ nguyên
router.delete(
  '/items/:id/photos/:photoId', 
  menuItemPhotoController.deletePhoto
);

router.patch(
  '/items/:id/photos/:photoId/primary', 
  menuItemPhotoController.setPrimaryPhoto
);

export default router;