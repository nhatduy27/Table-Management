import multer from 'multer';
import path from 'path';

// 1. Cấu hình nơi lưu (Memory để đẩy lên Cloudinary)
const storage = multer.memoryStorage();

// 2. Bộ lọc file
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    // Check đuôi file
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    // Check mimetype
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ cho phép file ảnh (jpeg, jpg, png, webp)'));
    }
};

// 3. Khởi tạo Multer (Đã đưa ra ngoài hàm fileFilter)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 5 // Tối đa 5 file
    }
});

// 4. Export các middleware
export const uploadMenuItemPhotos = upload.array('photos', 5);

export const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File quá lớn. Tối đa 5MB mỗi file'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Tối đa 5 file mỗi lần upload'
            });
        }
    }
    
    if (err) {
        return res.status(400).json({
            error: err.message
        });
    }
    
    next();
};