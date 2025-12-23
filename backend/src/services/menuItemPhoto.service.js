// src/services/menuItemPhoto.service.js
import { Op } from 'sequelize';
import db from '../models/index.js'; // <--- IMPORT TỪ FILE INDEX VỪA TẠO
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary.js';

// Lấy các thành phần cần thiết ra
const { MenuItem, MenuItemPhoto, sequelize } = db;

class MenuItemPhotoService {
  
  // POST: Upload multiple photos
  async uploadPhotos(menuItemId, files) {
    // Dùng transaction từ instance chung
    const transaction = await sequelize.transaction();
    let uploadedPhotos = [];

    try {
      // 1. Kiểm tra menu item tồn tại
      const menuItem = await MenuItem.findByPk(menuItemId, { transaction });
      if (!menuItem) {
        const error = new Error(`Menu item ${menuItemId} không tồn tại`);
        error.statusCode = 404;
        throw error;
      }

      // 2. Kiểm tra số lượng ảnh
      const existingCount = await MenuItemPhoto.count({
        where: { menu_item_id: menuItemId },
        transaction
      });

      if (existingCount + files.length > 10) {
        const error = new Error('Mỗi món chỉ được tối đa 10 ảnh');
        error.statusCode = 400;
        throw error;
      }

      const shouldSetPrimary = existingCount === 0;

      // 3. Upload loop
      for (const [index, file] of files.entries()) {
        // Validation file buffer
        if (!file.buffer) continue;

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 10);
        const fileName = `menu-${menuItemId}-${timestamp}-${randomStr}`;

        // Upload Cloudinary
        const url = await uploadBufferToCloudinary(
          file.buffer,
          `menu-items/${menuItemId}`,
          fileName
        );

        // Save DB
        const photo = await MenuItemPhoto.create({
          menu_item_id: menuItemId,
          url: url,
          is_primary: shouldSetPrimary && index === 0,
        }, { transaction });

        uploadedPhotos.push(photo);
      }

      await transaction.commit();
      return uploadedPhotos;

    } catch (error) {
      await transaction.rollback();
      // Cleanup Cloudinary
      const cleanupPromises = uploadedPhotos.map(p => deleteFromCloudinary(p.url));
      await Promise.allSettled(cleanupPromises);
      throw error;
    }
  }

  // DELETE: Remove photo
  async deletePhoto(menuItemId, photoId) {
    const transaction = await sequelize.transaction();

    try {
      const photo = await MenuItemPhoto.findOne({
        where: { id: photoId, menu_item_id: menuItemId },
        transaction
      });

      if (!photo) {
        const error = new Error('Ảnh không tồn tại');
        error.statusCode = 404;
        throw error;
      }

      // Logic đổi Primary nếu xóa ảnh chính
      if (photo.is_primary) {
        const nextPhoto = await MenuItemPhoto.findOne({
          where: {
            menu_item_id: menuItemId,
            id: { [Op.ne]: photoId }
          },
          order: [['created_at', 'ASC']],
          transaction
        });

        if (nextPhoto) {
          await nextPhoto.update({ is_primary: true }, { transaction });
        }
      }

      // Xóa Cloudinary & DB
      await deleteFromCloudinary(photo.url);
      await photo.destroy({ transaction });

      await transaction.commit();
      return { success: true };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // PATCH: Set primary
  async setPrimaryPhoto(menuItemId, photoId) {
    const transaction = await sequelize.transaction();

    try {
      const photo = await MenuItemPhoto.findOne({
        where: { id: photoId, menu_item_id: menuItemId },
        transaction
      });

      if (!photo) {
        throw new Error('Ảnh không tồn tại');
      }

      // Reset all -> Set one
      await MenuItemPhoto.update(
        { is_primary: false },
        { where: { menu_item_id: menuItemId }, transaction }
      );

      await photo.update({ is_primary: true }, { transaction });

      await transaction.commit();
      return photo;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default new MenuItemPhotoService();