// controllers/menuItemPhoto.controller.js
import menuItemPhotoService from '../../services/menuItemPhoto.service.js';

class MenuItemPhotoController {
    // POST /api/admin/menu/items/:id/photos
    uploadPhotos = async (req, res) => {
        try {
            const { id: menuItemId } = req.params;
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Vui lòng chọn ít nhất một ảnh' });
            }

            const photos = await menuItemPhotoService.uploadPhotos(menuItemId, req.files);
            res.status(201).json({ success: true, photos });
            
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    };

    // DELETE /api/admin/menu/items/:id/photos/:photoId
    deletePhoto = async (req, res) => {
        try {
            const { id: menuItemId, photoId } = req.params;
            await menuItemPhotoService.deletePhoto(menuItemId, photoId);
            res.json({ success: true, message: 'Đã xóa ảnh' });
            
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    };

    // PATCH /api/admin/menu/items/:id/photos/:photoId/primary
    setPrimaryPhoto = async (req, res) => {
        try {
            const { id: menuItemId, photoId } = req.params;
            const photo = await menuItemPhotoService.setPrimaryPhoto(menuItemId, photoId);
            res.json({ success: true, message: 'Đã đặt làm ảnh chính', photo });
            
        } catch (error) {
            res.status(error.statusCode || 500).json({ error: error.message });
        }
    };
}

export default new MenuItemPhotoController();