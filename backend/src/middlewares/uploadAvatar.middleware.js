// src/middlewares/uploadAvatar.middleware.js
import multer from 'multer';
import path from 'path';

// Cấu hình Multer cho avatar
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép file ảnh (jpeg, jpg, png, webp, gif)'));
    }
};

// Tạo instance multer cho avatar (chỉ 1 file)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1 // Chỉ 1 file cho avatar
    }
});

// Middleware upload avatar
export const uploadAvatar = upload.single('avatar');

// Middleware xử lý lỗi upload
export const handleAvatarUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File ảnh quá lớn. Tối đa 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ được upload 1 ảnh đại diện'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Trường upload phải có tên là "avatar"'
            });
        }
    }
    
    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'Lỗi upload file'
        });
    }
    
    next();
};

// Export default
export default {
    uploadAvatar,
    handleAvatarUploadErrors
};